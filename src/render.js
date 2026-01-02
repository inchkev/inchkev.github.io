/**
 * render.js for https://kevinnchen.com
 * Copyright (C) 2023-2026  Kevin N. Chen
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

// Pre-compiled regexes
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|apng|svg|bmp|ico)$/i;
const IMAGE_THUMB_EXT_RE = /\.(jpe?g|png|webp)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|ogg)$/i;
const PDF_EXT_RE = /\.pdf$/i;
const YOUTUBE_RE = /^(?:https?:\/\/)?(?:(?:www\.|m\.)?youtube\.com|youtu\.be)\/(?:(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))?([a-zA-Z0-9_-]+)(?:\S*)$/;

// Directory names
const CONTENT_DIRNAME = 'content';
const PROJECTS_DIRNAME = 'projects';

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


function getSizeOfImg(src) {
  try {
    const dimensions = sizeOf(src);
    if (dimensions.orientation == 6 || dimensions.orientation == 8) {
      return { width: dimensions.height, height: dimensions.width };
    }
    return { width: dimensions.width, height: dimensions.height };
  } catch (err) {
    console.error(err);
    return { width: 0, height: 0 };
  }
}

async function getSizeOfVideo(src) {
  if (!VIDEO_EXT_RE.test(src)) {
    return { width: 0, height: 0 };
  }
  try {
    return await getVideoDimensions(src);
  } catch (err) {
    console.error(err);
    return { width: 0, height: 0 };
  }
}


async function main() {
  const templates = new EJSTemplateStore();
  var projects = {};

  const projectDir = path.join(__dirname, '..', PROJECTS_DIRNAME);
  const contentDir = path.join(__dirname, '..', CONTENT_DIRNAME);
  const contentFiles = await fs.readdir(contentDir);

  /* render project pages */

  for (const filename of micromatch(contentFiles, ['*.json', '!_*.json', '!home.json'])) {
    console.log(`READ ${CONTENT_DIRNAME}/${filename}`);
    const contentPath = path.join(contentDir, filename);
    let data = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    
    // format title
    // data.title = await marked.parseInline(data.title);
    
    // format description
    data.description = await marked.parseInline(data.description);

    // format descriptionLong
    data.descriptionLong = await Promise.all(
      data.descriptionLong.map(raw => marked.parseInline(raw))
    );

    // format thumbnail
    if (
        typeof data.thumbnail.src === 'string' &&
        IMAGE_THUMB_EXT_RE.test(data.thumbnail.src)) {
      data.thumbnail.type = 'image';
      const dimensions = getSizeOfImg(path.join(__dirname, '..', data.thumbnail.src));
      data.thumbnail.width = dimensions.width;
      data.thumbnail.height = dimensions.height;
    } else if (
        data.thumbnail.src.constructor == Object &&
        ('mp4' in data.thumbnail.src || 'webm' in data.thumbnail.src)) {
      data.thumbnail.type = 'video';
      const dimensions = await getSizeOfVideo(path.join(__dirname, '..', data.thumbnail.src.webm));
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
            if (IMAGE_EXT_RE.test(media.src)) {
              media.type = 'image';
              const dimensions = getSizeOfImg(path.join(__dirname, '..', media.src));
              media.width = dimensions.width;
              media.height = dimensions.height;

            } else if (YOUTUBE_RE.test(media.src)) {
              media.type = 'youtube-embed';
              const matches = media.src.match(YOUTUBE_RE);
              media.videoId = matches[1];
              // console.log(media.videoId);

              // TODO: auto get youtube video title and aspect ratio
              media.aspectRatio = media.aspectRatio.replace(/[/:]/, '-');

            } else if (PDF_EXT_RE.test(media.src)) {
              media.type = 'pdf';
              media.src += "#toolbar=0&navpanes=0&zoom=FitW";
              media.aspectRatio = media.aspectRatio.replace(/[/:]/, '-');

            } else {
              media.type = 'link';
            }

          } else if (media.src.constructor == Object) {
            if ('mp4' in media.src || 'webm' in media.src) {
              media.type = 'video';
              const dimensions = await getSizeOfVideo(path.join(__dirname, '..', media.src.webm));
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
        console.log(`Duplicate project ${data.slug}, skipping`);
      } else {
        console.log(`  WRITE ${PROJECTS_DIRNAME}/${data.slug}.html`);
        projects[data.slug] = data;
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* render home page */

  const homePath = path.join(contentDir, 'home.json');
  const home = JSON.parse(await fs.readFile(homePath, 'utf8'));

  const homeData = {
    projects: home.projects
      .filter(slug => slug in projects)
      .map(slug => projects[slug])
  };
  const html = (await templates.get('index'))(homeData);
  const outputPath = path.join('index.html');
  try {
    await fs.writeFile(outputPath, html);
    console.log(`WRITE ${outputPath}`);
  } catch (err) {
    console.error(err);
  }
}


const start = performance.now();
main().then(() => {
  console.log(`Took ${(performance.now() - start).toFixed(2)}ms`);
});
