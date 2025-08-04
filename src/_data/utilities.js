const activePath = (itemUrl, currentUrl) => (currentUrl && currentUrl.includes(itemUrl)) ? true : false;

function getPage(itemUrl, collection) {
  let page;
  collection.forEach(item => {
    if (item.url == itemUrl) {
      page = item;
    }
  })
  if (page !== undefined) {
    return page.data;
  }
};

function getCollectionByName(collections, name) {
  return collections[name];
}

function getfullSectionByName(subjects, name) {
  return subjects.find((element) => element.name == name);
}

/*
/ Remove current page from list of podcast episodes.
*/
function podcastWithoutCurrent(collections, itemUrl) {
  let allPodcasts = collections.podcastEpisodes;

  return allPodcasts.filter((page) => {
    return page.url !== itemUrl;
  });  
}

/*
/ Pop the last item off an array and add something new.
/
/ Can handle a string or array value.
*/
function popIn(array, value) {
  if (Array.isArray(array) !== true) {
    throw new Error("Not an array for popIn");
  }
  if (Array.isArray(value) !== true && typeof value !== 'string') {
    throw new Error("popIn can only add an array or string");
  }
  // Take a clone of the original array.
  let arr = array.slice();
  // Pop the last item off the array
  arr.pop();
  // Add the new value, whether array or string, and return
  Array.isArray(value) ? arr = [].concat(arr, value) : arr.push(value);
  return arr;
}

/*
/ Push a new item onto an array.
*/
function pushIn(array, value) {
  if (Array.isArray(array) !== true) {
    throw new Error("Not an array for pushIn");
  }
  if (Array.isArray(value) !== true && typeof value !== 'string') {
    throw new Error("popIn can only add an array or string");
  }
  // Take a clone of the original array.
  let arr = array.slice();
  // Add the new value, whether array or string, and return
  Array.isArray(value) ? arr = [].concat(arr, value) : arr.push(value);
  return arr;
}

export default {activePath, getPage, getCollectionByName, getfullSectionByName, podcastWithoutCurrent, popIn, pushIn};