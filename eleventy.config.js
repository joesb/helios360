import { IdAttributePlugin, InputPathToUrlTransformPlugin, EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItUnderline from "markdown-it-underline";
import markdownItAnchor from "markdown-it-anchor";
import markdownItDefList from "markdown-it-deflist";
import Image from "@11ty/eleventy-img";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
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
import { minify } from "html-minifier-terser";
import schema from "@quasibit/eleventy-plugin-schema";
import pluginTOC from "eleventy-plugin-toc";
import dotenv from "dotenv/config";
import minifyXML from "minify-xml";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {

  const environment = process.env.ELEVENTY_ENV;
  const PROD_ENV = 'production';
  const isProd = environment === PROD_ENV;

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
  eleventyConfig.addPlugin(schema);
  eleventyConfig.addPlugin(pluginTOC, {
    tags: ['h2', 'h3', 'h4'],
    wrapper: 'nav',
    wrapperClass: 'page-toc'
  });
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });

  // eleventyConfig.addPlugin(feedPlugin, {
	// 	type: "atom", // or "rss", "json"
	// 	outputPath: "/feed.xml",
	// 	collection: {
	// 		name: "all", // iterate over `collections.all`
	// 		limit: 100,  // 0 means no limit
	// 	},
	// 	metadata: {
	// 		language: "en",
	// 		title: "Helios360",
	// 		subtitle: "Management Consulting for Client Services and Gen-AI Delivery",
	// 		base: "https://helios360.co.uk",
	// 		author: {
	// 			name: "Joe Baker",
	// 			email: "", // Optional
	// 		}
	// 	}
	// });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
		formats: ["webp", "jpeg"],
		// formats: ["auto"],

		// optional, output image widths
		widths: [800, 500, 300],

    urlPath: "/public/img/",
    outputDir: "./content/public/img",

		// optional, attributes assigned on <img> override these values.
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
			sizes: "auto",
		},
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

  // Minify HTML
  eleventyConfig.addTransform("minify", function (content) {
		if ((this.page.outputPath || "").endsWith(".html")) {
			let minified = minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: isProd
			});

			return minified;
		}
    else if ((this.page.outputPath || "").endsWith(".xml")) {
      let minified = minifyXML(content);

      return minified;
    }

		// If not an HTML output, return content as-is
		return content;
	});

  // JSON output stringify filter
  eleventyConfig.addFilter('stringify', (data) => {
    return JSON.stringify(data, null, "\t")
  })

  // Date filter to convert date objects to ISO 8601 format
  eleventyConfig.addFilter('iso8601', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toISO()
  })

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

  eleventyConfig.addPairedShortcode("Note", function(content, mdContent = false, classes, useIcon = false) { 
      content = mdContent ? markdownLibrary.render(content) : content;
      return '<div class="content-note margin-block-lg padding-md' + ( classes ? ' ' + classes : '' ) + (useIcon ? ' content-note-use-icon' : '') + '">' + content + '</div>'
    }
  );

  eleventyConfig.addPairedShortcode("HelpCard", function(content, mdContent = false, classes) {
      content = mdContent ? markdownLibrary.render(content) : content;
      return '<div class="helpcard margin-block padding-block-lg padding-inline-lg margin-block-lg' + ( classes ? ' ' + classes.join(' ') : '' ) +'">' + content + '</div>'
    }
  );

  eleventyConfig.addPairedShortcode("ContentGrid", (content, classes = '') => {
    return '<div class="content-grid' + ( classes ? ` ${classes}` : '') +'">' + content + '</div>';
  });

  // Coloured BG section
  // 
  // Color options (always lowercase):
  // - primary (Icterine ; default)
  // - secondary (Ming)
  // - tertiary (Victoria)
  // - black
  // - white
  // - grey
  eleventyConfig.addPairedShortcode("ColourBG", (content, color, classes = []) => {
    return '<div class="section-coloured-bg margin-block-vlg padding-block-vlg content-canvas-item-full content-canvas' + (color ? ' section-coloured-bg--' + color : '') + ( classes.length ? ' ' + classes.join(' ') : '' ) + '">' + content  + '</div>';
  });

  // Images
  eleventyConfig.addShortcode("image", async function (src, alt, cls, widths = [300, 620], sizes = "auto", picCls = "", imgAttrs = {}) {
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
      fetchpriority: "auto",
      "eleventy:ignore" : true
		};

    let combinedImageAttributes = Object.assign({}, imageAttributes, imgAttrs);

    let options = {
      pictureAttributes: {
        class: picCls
      }
    }

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, combinedImageAttributes, options);
	});

  eleventyConfig.addAsyncShortcode("imageData", async function(src) {
    var picture = await getPictureData(src, [1200]);
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

  eleventyConfig.addPairedShortcode("ImgFigure", function(content, caption = false, classes = [], md = true) {
    if (caption) {
      caption = '<figcaption>' + caption + '</figcaption>';
    }
    return '<figure' + (classes.length ? ' class="' + classes.join(" ") + '"' : '') + '>' + (md ? markdownLibrary.renderInline(content) : content) + (caption ? caption : '') +'</figure>';
  });

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

  // Check if a thing is a string
  eleventyConfig.addFilter('is_string', function(obj) {
    return typeof obj == 'string'
  });

  // Encode a URL string
  eleventyConfig.addFilter('encodeUri', (text) => {
    return encodeURI(text);
  });

  eleventyConfig.addFilter('trimTrailingSlash', (text) => {
    return trimTrailingChars(text,  '/');
  });

  eleventyConfig.addFilter('trimTrailingChars', (text, charToTrim = '/') => {
    return trimTrailingChars(text, charToTrim);
  });

  eleventyConfig.addFilter('padNumber', (text, num, char) => {
    return text.toString().padStart(num, char);
  })

    /* COLLECTIONS */

  // Promoted Content collection
  eleventyConfig.addCollection('handbookPromoted', (collection) => {
    var nav = collection.getFilteredByTag('#handbookPromoted');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Promoted Handbook Content for Homepage collection
  eleventyConfig.addCollection('handbookPromotedHP', (collection) => {
    var nav = collection.getFilteredByTag('#handbookPromotedHP');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Promoted Services collection
  eleventyConfig.addCollection('servicePromoted', (collection) => {
    var nav = collection.getFilteredByTag('#servicePromoted');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Content for feed.xml
  eleventyConfig.addCollection('feed', (collection) => {
    // var nav = collection.getFilteredByTag('#handbookPromoted');
    // var nav1 = collection.getFilteredByTag('#servicePromoted');
    // nav = nav.concat(nav1);
    var nav = collection.getFilteredByGlob('./content/**/*.md');
    return nav.length ? sortByDate(nav) : [];
  });

  // Handbook: Why collection
  eleventyConfig.addCollection('handbookWhy', (collection) => {
    var nav = collection.getFilteredByTag('#handbookWhy');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Handbook: What collection
  eleventyConfig.addCollection('handbookWhat', (collection) => {
    var nav = collection.getFilteredByTag('#handbookWhat');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Handbook: Delivery collection
  eleventyConfig.addCollection('handbookDelivery', (collection) => {
    var nav = collection.getFilteredByTag('#handbookDelivery');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Handbook: Strategy collection
  eleventyConfig.addCollection('handbookStrategy', (collection) => {
    var nav = collection.getFilteredByTag('#handbookStrategy');
    return nav.length ? sortByOrder(nav, 'eleventyNavigation') : [];
  });

  // Podcast episode collection
  eleventyConfig.addCollection('podcastEpisodes', (collection) => {
    var episodes = collection.getFilteredByGlob('./content/podcast/ep*.md');
    return episodes.length ? sortByDate(episodes) : [];
  });

  eleventyConfig.addFilter('sortByDate', (collection, andSticky = true) => {
    return sortByDate(collection, andSticky);
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
      else if (a.data.date < b.data.updated) return -1;
      else if (a.data.date > b.data.updated) return 1;
      else if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  // Sort by episode number
  function sortByEpNumber(collection, andSticky = true) {
    return collection.sort((a, b) => {
      if (andSticky && b.data.sticky) return -1;
      else if (a.data.number < b.data.number) return -1;
      else if (a.data.number > b.data.number) return 1;
      else return 0;
    });
  }

  function trimTrailingChars(s, charToTrim) {
    var regExp = new RegExp(charToTrim + "+$");
    var result = s.replace(regExp, "");

    return result;
  }

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link do-not-display",
      symbol: "#",
      level: [1,2,3,4],
    }),
    slugify: eleventyConfig.getFilter("slugify")
  }).use(markdownItAttrs).use(markdownItUnderline).use(markdownItDefList);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPairedShortcode("Markdown", function(content, ril = false) {
    return ril ? markdownLibrary.renderInline(content) : markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('content/public/');
  eleventyConfig.addPassthroughCopy('./functions/');
  eleventyConfig.addWatchTarget('./src/_sass/');
  // Put robots.txt in root
  eleventyConfig.addPassthroughCopy({ 'content/robots.txt': '/robots.txt' });
  eleventyConfig.addPassthroughCopy({ 'content/favicon.ico': '/favicon.ico' });
  eleventyConfig.addPassthroughCopy({ 'content/site.webmanifest': '/site.webmanifest' });
  // IndexNow key
  eleventyConfig.addPassthroughCopy({ 'content/44ce983d229a4af5bc3794403478dc39.txt': '/44ce983d229a4af5bc3794403478dc39.txt' });

  if (process.env.ELEVENTY_ENV !== 'local') {
    eleventyConfig.ignores.add('content/indexnow.njk');
  }
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