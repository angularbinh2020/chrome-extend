//@ts-check
const CONFIG = {
  TIME_INTERVAL: 300,
  EXPORT_ID: "EXPORT_ID",
  XLSX_SCRIPT_ID: "XLSX_SCRIPT_ID",
  REG_TAGS_REMOVE: [
    /<script id="SIGI_STATE" ([^>]*)?>.*?<\/script>/gm,
    /<img([^>]*)?>.*?<\/img>/gm,
    /<style([^>]*)?>.*?<\/style>/gm,
    /<iframe([^>]*)?>.*?<\/iframe>/gm,
    /<video([^>]*)?>.*?<\/video>/gm,
  ],
};

function getVideosUrl() {
  return Array.from(
    document.querySelectorAll(
      `[data-e2e="user-post-item-list"] [data-e2e="user-post-item-desc"] a[href^="${location.href}"]`
    ),
    (element) => element.href
  );
}

function removeAllUnnecessaryTag(htmlText) {
  let result = htmlText;
  CONFIG.REG_TAGS_REMOVE.forEach((reg) => {
    result = result.replace(reg, "");
  });
  return result;
}

async function getVideoMeta(url) {
  try {
    const parser = new DOMParser();
    const res = await fetch(url);
    const rawHtmlText = await res.text();
    const objectString = rawHtmlText
      .split('<script id="SIGI_STATE" type="application/json">')[1]
      .split("</script>")[0];
    const appContext = JSON.parse(objectString);
    const videoId = url.split("/").slice(-1);
    const videoInfo = appContext.ItemModule[videoId];
    return {
      commentCounts: videoInfo?.stats?.commentCount ?? 0,
      viewCount: videoInfo?.stats?.diggCount ?? 0,
      collectCount: videoInfo?.stats?.collectCount ?? 0,
      shareCounts: videoInfo?.stats?.shareCount ?? 0,
      hashTags: videoInfo?.textExtra?.map((tag) => tag.hashtagName) || [],
      url: url,
    };
  } catch (e) {
    return { error: e };
  }
}

async function getVideosMeta(urls) {
  return new Promise((resolve) => {
    let videoIndex = 0;
    const videos = [];
    const getMetaData = async () => {
      const videoUrl = urls[videoIndex];
      if (videoUrl) {
        const video = await getVideoMeta(videoUrl);
        videos.push(video);
        console.log(`completed: ${videoIndex + 1} / ${urls.length}`);
        videoIndex++;
        getMetaData();
        return;
      }
      resolve(videos);
    };
    getMetaData();
  });
}

async function exportData() {
  console.log(XLSX);
  await scrollDownLoadAllVideos();
  const urls = getVideosUrl();
  const videos = await getVideosMeta(urls);
  console.log(videos);
}

async function scrollDownLoadAllVideos() {
  return new Promise((resolve) => {
    var totalHeight = 0;
    var distance = 100;
    var timer = setInterval(() => {
      var scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;

      if (totalHeight >= scrollHeight) {
        clearInterval(timer);
        resolve(null);
      }
    }, CONFIG.TIME_INTERVAL);
  });
}

if (!document.getElementById(CONFIG.EXPORT_ID)) {
  const exportBtn = document.createElement("button");
  exportBtn.innerText = "Export data";
  exportBtn.setAttribute(
    "style",
    "background-color: black; color: white; padding: 15px 20px; position: fixed; top: 150px; right: 25px;"
  );
  exportBtn.setAttribute("id", CONFIG.EXPORT_ID);
  exportBtn.addEventListener("click", exportData);
  document.body.appendChild(exportBtn);
}

// if (!document.getElementById(CONFIG.XLSX_SCRIPT_ID)) {
//   const xlsxScript = document.createElement("script");
//   xlsxScript.setAttribute("id", CONFIG.XLSX_SCRIPT_ID);
//   xlsxScript.src =
//     "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
//   document.head.appendChild(xlsxScript);
// }
