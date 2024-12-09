import { IdAttributePlugin, InputPathToUrlTransformPlugin, EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import Image from "@11ty/eleventy-img";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import timeToRead  from "eleventy-plugin-time-to-read";
import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js";
import { inspect } from "util";
import { DateTime } from "luxon";

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
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });
  eleventyConfig.addPlugin(feedPlugin, {
		type: "rss", // or "atom", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "posts", // iterate over `collections.posts`
			limit: 25,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Helios360",
			subtitle: "Management Consulting for Client Services and Gen-AI Delivery",
			base: "https://helios360.co.uk",
			author: {
				name: "Joe Baker",
				email: "", // Optional
			}
		}
	});

  eleventyConfig.addFilter("debug", (content, inspectDepth = 4) => `<pre>${inspect(content, {depth: inspectDepth})}</pre>`);

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

  eleventyConfig.addPairedShortcode("Note", function(content, mdContent = false, classes, useIcon) { 
      content = mdContent ? markdownLibrary.render(content) : content;
      return '<div class="content-note margin-block-lg padding-block-sml padding-inline-sml' + ( classes ? ' ' + classes : '' ) + (useIcon ? ' content-note-use-icon' : '') + '">' + content + '</div>'
    }
  );

  eleventyConfig.addPairedShortcode("HelpCard", function(content, mdContent = false, classes) {
      content = mdContent ? markdownLibrary.render(content) : content;
      return '<div class="helpcard margin-block padding-block-sml padding-inline-sml margin-block-lg' + ( classes ? ' ' + classes.join(' ') : '' ) +'">' + content + '</div>'
    }
  );

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

  eleventyConfig.addFilter('maxDate', (list) => {
    return list.reduce((a, b) => {
      return new Date(a.date) > new Date(b.date) ? a : b;
    });
  });

  // Check a string starts with a character.
  eleventyConfig.addFilter('starts_with', function(str, prefix, not = false) {
    return str.startsWith(prefix) !== not;
  });

   // Readable Date filter
   eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

    /* COLLECTIONS */

  // Promoted Content collection
  eleventyConfig.addCollection('handbookPromoted', (collection) => {
    var nav = collection.getFilteredByTag('#handbookPromoted');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Promoted Services collection
  eleventyConfig.addCollection('servicePromoted', (collection) => {
    var nav = collection.getFilteredByTag('#servicePromoted');
    return nav.length ? sortByOrder(nav) : [];
  });


  function sortByOrder(collection, field = 'order', andSticky = false) {
    if (field == 'eleventyNavigation') {
      return collection.sort((a, b) => {
        if (andSticky && b.data.sticky) return 1;
        else if (a.data.eleventyNavigation.order < b.data.eleventyNavigation.order) return -1;
        else if (a.data.eleventyNavigation.order > b.data.eleventyNavigation.order) return 1;
        else return 0;
      });
    }
    else {
      return collection.sort((a, b) => {
        if (andSticky && b.data.sticky) return 1;
        else if (a.data.order < b.data.order) return -1;
        else if (a.data.order > b.data.order) return 1;
        else return 0;
      });
    }
  }

  function sortByDate(collection, andSticky = true) {
    return collection.sort((a, b) => {
      if (andSticky && b.data.sticky) return -1;
      else if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs).use(markdownIt11tyImage, {
    imgOptions: {
      widths: [800, 500, 300],
      formats: ["webp", "jpeg"],
      urlPath: "/public/img/",
      outputDir: "./content/public/img"
    },
    globalAttributes: {
      decoding: "async",
      // If you use multiple widths,
      // don't forget to add a `sizes` attribute.
      sizes: "100vw"
    }
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPairedShortcode("Markdown", function(content) {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('content/public/');
  eleventyConfig.addPassthroughCopy('./functions/');
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
