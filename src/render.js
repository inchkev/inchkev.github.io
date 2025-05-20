/**
 * render.js for https://kevinnchen.com
 * Copyright (C) 2023-2025  Kevin Chen
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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


async function getSizeOf(src) {
  if (/\.(jpe?g|png|gif|webp|apng|svg|bmp|ico)$/i.test(src)) {
    try {
      const dimensions = await sizeOf(src);
      if (dimensions.orientation == 6 || dimensions.orientation == 8) {
        return { width: dimensions.height, height: dimensions.width };
      }
      return {width: dimensions.width, height: dimensions.height};
    } catch (err) {
      console.error(err);
    }
  }
  if (/\.(mp4|webm|ogg)$/i.test(src)) {
    try {
      return await getVideoDimensions(src);
    } catch (err) {
      console.error(err);
    }
  }
  return { width: 0, height: 0 };
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
        /\.(jpe?g|png|webp)$/i.test(data.thumbnail.src)) {
      data.thumbnail.type = 'image';
      const dimensions = await getSizeOf(path.join(__dirname, '..', data.thumbnail.src));
      data.thumbnail.width = dimensions.width;
      data.thumbnail.height = dimensions.height;
    } else if (
        data.thumbnail.src.constructor == Object &&
        ('mp4' in data.thumbnail.src || 'webm' in data.thumbnail.src)) {
      data.thumbnail.type = 'video';
      const dimensions = await getSizeOf(path.join(__dirname, '..', data.thumbnail.src.webm));
      data.thumbnail.width = dimensions.width;
      data.thumbnail.height = dimensions.height;
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
            return { type: 'text', content: await marked.parseInline(media) };
          }

          if (media.constructor != Object) return [];

          if (typeof media.src === 'string') {
            if (/\.(jpe?g|png|gif|webp|apng|svg|bmp|ico)$/i.test(media.src)) {
              media.type = 'image';
              const dimensions = await getSizeOf(path.join(__dirname, '..', media.src));
              media.width = dimensions.width;
              media.height = dimensions.height;

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
            if ('mp4' in media.src || 'webm' in media.src) {
              media.type = 'video';
              const dimensions = await getSizeOf(path.join(__dirname, '..', media.src.webm));
              media.width = dimensions.width;
              media.height = dimensions.height;

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
