'use strict';

const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store = {
  currentPage: 1,
  feeds: [],
};

// 데이터 가져오기
function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 피드를 안 읽은 상태로 초기화
function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

// 뉴스 피드 불러오기
function newsFeed() {
  let newsFeed = store.feeds;
  const newsList = [];

  let template = `
    <div class="bg-gray-200 min-h-screen">
      <div class="bg-yellow-500 text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold text-white">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-100 duration-200 hover:text-gray-300">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="ml-4 text-gray-100 duration-200 hover:text-gray-300">
                Next
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}
      </div>
    </div>
  `;

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
      <div class="p-6 ${
        newsFeed[i].read ? 'bg-gray-300 text-gray-500' : 'bg-white'
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-yellow-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">
              ${newsFeed[i].comments_count}
            </div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div class="mr-4">
              <i class="fas fa-user mr-1"></i>${newsFeed[i].user}
            </div>
            <div class="mr-4">
              <i class="fas fa-heart mr-1"></i>${newsFeed[i].points}
            </div>
            <div>
              <i class="fas fa-clock mr-1"></i>${newsFeed[i].time_ago}
            </div>
          </div>
        </div>
      </div>
    `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace(
    '{{__prev_page__}}',
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace(
    '{{__next_page__}}',
    store.currentPage === Math.ceil(newsFeed.length / 10)
      ? store.currentPage
      : store.currentPage + 1
  );

  container.innerHTML = template;
}

// 뉴스 본문 불러오기
function newsDetail() {
  const id = location.hash.substr(7);
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  let template = `
    <div class="bg-gray-200 min-h-screen pb-8">
      <div class="bg-yellow-500 text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold text-white">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-100 duration-200 hover:text-gray-300">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="h-full border rounded-xl bg-white m-6 p-4">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>
        {{__comments__}}
      </div>
    </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  // 댓글 불러오기
  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>
        `);

      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join('');
  }

  container.innerHTML = template.replace(
    '{{__comments__}}',
    makeComment(newsContent.comments)
  );
}

function router() {
  const routePath = location.hash;

  if (routePath === '') {
    newsFeed();
  } else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', router);

router();
