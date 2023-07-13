// render-pages.js by Kevin Chen

import ejs from 'ejs';
import { promises as fs } from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import getVideoDimensions from 'get-video-dimensions';
import micromatch from 'micromatch';
import { marked } from 'marked';
marked.use({
  async: true,
  mangle: false,
  headerIds: false,
});


// get __filename and __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


class EJSTemplateStore {
  #templates = {};
  #templateDir = path.join(__dirname, '..', 'views');

  async get(name) {
    if (!(name in this.#templates)) {
      const templatePath = path.join(this.#templateDir, name + '.ejs');
      this.#templates[name] = ejs.compile(
        await fs.readFile(templatePath, 'utf8'),
        {'filename': templatePath});
    }
    return this.#templates[name];
  }
}


async function main() {
  const templates = new EJSTemplateStore();
  var projects = {};

  const projectDir = path.join(__dirname, '..', 'projects');
  const contentDir = path.join(__dirname, '..', 'content');
  const contentFiles = await fs.readdir(contentDir);

  /* render project pages */

  for (const filename of micromatch(contentFiles, ['*.json', '!_*.json', '!home.json'])) {
    console.log('Processing', filename);
    const contentPath = path.join(contentDir, filename);
    let data = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    
    // format title
    // data.title = await marked.parseInline(data.title);
    
    // format description
    data.description = await marked.parseInline(data.description);

    // format descriptionLong
    data.descriptionLong = await Promise.all(
      data.descriptionLong.map(async (raw) => await marked.parseInline(raw))
    );

    // format thumbnail
    if (
      typeof data.thumbnail.src === 'string' &&
      /\.(jpe?g|png|webp)$/i.test(data.thumbnail.src)
    ) {
      data.thumbnail.type = 'image';
    } else if (
      data.thumbnail.src.constructor == Object &&
      ('webm' in data.thumbnail.src || 'mp4' in data.thumbnail.src)) {
      data.thumbnail.type = 'video';
    }

    // format main
    for (const section of data.main) {
      // if no class is specified, set type to raw
      if (!('class' in section)) {
        section.type = 'raw';
        continue;
      }

      section.type = 'regular';
      section.contents = (await Promise.all(
        section.contents.map(async (media) => {
          if (typeof media === 'string') {
            return {type: 'text', content: await marked.parseInline(media)};
          }

          if (media.constructor != Object) {
            return [];
          }

          if (typeof media.src === 'string') {
            if (/\.(jpe?g|png|gif|webp|apng|svg|bmp|ico)$/i.test(media.src)) {
              media.type = 'image';
              try {
                const dimensions = await sizeOf(path.join(__dirname, '..', media.src));
                if (dimensions.orientation == 6 || dimensions.orientation == 8) {
                  media.width = dimensions.height;
                  media.height = dimensions.width;
                } else {
                  media.width = dimensions.width;
                  media.height = dimensions.height;
                }
              } catch (err) {
                console.error('Error reading image:', media.src);
                console.error(err);
              }

            } else if (/^(https?:\/\/)?((www\.|m\.)?youtube\.com|youtu\.be)\/(watch|v|embed(\.php)?(\?.*v=|\/))?[a-zA-Z0-9\_-]+\S*$/.test(media.src)) {
              media.type = 'youtube-embed';
              const re = /^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtube\.com|youtu\.be)\/(?:(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))?([a-zA-Z0-9\_-]+)(?:\S*)$/;
              const matches = media.src.match(re);
              media.videoId = matches[1];
              // console.log(media.videoId);

              // TODO: auto get youtube video title and aspect ratio
              media.aspectRatio = media.aspectRatio.replace(/[\/:]/, '-');

            } else if (/\.(pdf)$/i.test(media.src)) {
              media.type = 'pdf';
              media.src += "#toolbar=0&navpanes=0&zoom=FitW";
              media.aspectRatio = media.aspectRatio.replace(/[\/:]/, '-');
            
            } else {
              media.type = 'link';
            }

          } else if (media.src.constructor == Object) {
            if ('webm' in media.src || 'mp4' in media.src) {
              media.type = 'video';
              try {
                const dimensions = await getVideoDimensions(path.join(__dirname, '..', media.src));
                media.width = dimensions.height;
                media.height = dimensions.width;
              } catch (err) {
                console.error('Error reading video:', media.src);
                console.error(err);
              }
            } else {
              return [];
            }

          } else {
            return [];
          }

          if ('caption' in media) {
            media.type += '-caption';
          }

          return media;
        })
      )).flat();
    }

    const html = (await templates.get('project'))(data);
    const outputPath = path.join(projectDir, data.slug + '.html');
    try {
      await fs.writeFile(outputPath, html);
      if (data.slug in projects) {
        console.log(`Duplicate project \t${data.slug}, skipping`);
      } else {
        console.log(`\tWrote ${outputPath}`);
        projects[data.slug] = data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* render home page */

  const homePath = path.join(contentDir, 'home.json');
  const home = JSON.parse(await fs.readFile(homePath, 'utf8'));

  let homeData = {};
  homeData.projects = (await Promise.all(
    home.projects.map(async (project) => {
      if (project in projects) {
        return projects[project];
      }
      return [];
    })
  )).flat();
  const html = (await templates.get('index'))(homeData);
  const outputPath = path.join('index.html');
  try {
    await fs.writeFile(outputPath, html);
    console.log(`\nWrote ${outputPath}`);
  } catch (err) {
    console.error(err);
  }

}


main();
