import { IdAttributePlugin, InputPathToUrlTransformPlugin, EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginRss from "@11ty/eleventy-plugin-rss";
import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {

  // Add the dev server middleware manually
  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: "h1,h2,h3,h4,h5,h6", // default

		// swaps html entities (like &amp;) to their counterparts before slugify-ing
		decodeEntities: true,

		// by default we use Eleventy’s built-in `slugify` filter:
		slugify: eleventyConfig.getFilter("slugify"),
  });
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin);
  eleventyConfig.addPlugin(pluginRss);

    // Minify CSS
    eleventyConfig.addFilter('cssmin', function (code) {
      var css = new CleanCSS({}).minify(code).styles;
      return postCSS([ autoprefixer ]).process(css).css;
    });
  
    // Minify JS
    eleventyConfig.addFilter('jsmin', function (code) {
      let minified = UglifyJS.minify(code);
      if (minified.error) {
        console.log('UglifyJS error: ', minified.error);
        return code;
      }
      return minified.code;
    });


  // Return active path attributes
  eleventyConfig.addShortcode('activepath', function (itemUrl, currentUrl, currentClass = "current", prefix = '') {
    if (itemUrl == '/' && itemUrl !== currentUrl) {
      return '';
    }
    if (currentUrl && currentUrl.startsWith(itemUrl)) {
      return prefix + currentClass;
    }
    return '';
  });

  // Images
  eleventyConfig.addShortcode("image", async function (src, alt, cls, widths = [300, 620], sizes = "100vh", picCls = "") {
		let metadata = await Image(src, {
			widths,
			formats: ["webp", "jpeg"],
      urlPath: "/public/img/",
      outputDir: "./content/public/img/"
		});

		let imageAttributes = {
      class: cls,
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

    let options = {
      pictureAttributes: {
        class: picCls
      }
    }

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes, options);
	});

  eleventyConfig.addAsyncShortcode("imageData", async function(src) {
    var picture = await getPictureData(src, [800]);
    return picture.jpeg[0].url;
  });

  async function getPictureData(src, widths = [300, 620, 1000, 1980]) {
    let metadata = await Image(src, {
      widths: widths,
      formats: ['jpeg'],
      urlPath: "/public/img/",
      outputDir: "./content/public/img/"
    });
    return metadata;
  };

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs).use(markdownIt11tyImage);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('content/public/');
  eleventyConfig.addWatchTarget('./src/_sass/');
}

export const config = {
  templateFormats: [
    'md',
    'njk',
    'html',
    'liquid'
  ],

  // If your site lives in a different subdirectory, change this.
  // Leading or trailing slashes are all normalized away, so don’t worry about it.
  // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
  // This is only used for URLs (it does not affect your file structure)
  pathPrefix: '/',

  markdownTemplateEngine: 'liquid',
  htmlTemplateEngine: 'njk',
  dataTemplateEngine: 'njk',
  passthroughFileCopy: true,
  
  dir: {
    input: 'content',
    includes: '../src/_includes',
    layouts: '../src/_includes/layouts',
    data: '../src/_data',
    output: '_site',
  },
};
