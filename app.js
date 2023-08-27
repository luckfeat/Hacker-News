const ajax = new XMLHttpRequest();
const URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const root = document.querySelector('#root');
const div = document.createElement('div');
const store = {
  currentPage: 1,
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function newsFeed() {
  const newsFeed = getData(URL);
  const newsList = [];

  let template = /* html */ `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="pagination items-center justify-end">
              <a class=" prev text-gray-500">
              </a>
              <a  class=" next text-gray-500 ml-4">
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

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <div class="p-6 ${
      newsFeed[i].read ? 'bg-red-500' : 'bg-white'
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
            newsFeed[i].comments_count
          }</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
          <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
          <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
        </div>  
      </div>
    </div>    
  `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));

  root.innerHTML = template;

  const pagination = document.querySelector('.pagination');
  const prevAnchor = document.querySelector('.prev');
  const nextAnchor = document.querySelector('.next');

  if (store.currentPage > 1) {
    const prev = document.createElement('a');
    prev.innerHTML = `<a href="#/page/${store.currentPage - 1}">Prev</a>`;
    pagination.replaceChild(prev, prevAnchor);
  }

  if (store.currentPage < newsFeed.length / 10) {
    const next = document.createElement('a');
    next.innerHTML = `<a href="#/page/${store.currentPage + 1}">Next</a>`;
    pagination.replaceChild(next, nextAnchor);
  }
}

function newsDetail() {
  const id = window.location.hash.split('/')[2];
  const newsContent = getData(CONTENT_URL.replace('@id', id));
  console.log(newsContent);
  let template = /* html */ `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
    `;

  function makeCommet(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(/* html */ `
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);
      if (comments[i].comments.length > 0) {
        commentString.push(makeCommet(comments[i].comments, called + 1));
      }
    }

    return commentString.join('');
  }

  root.innerHTML = template.replace(
    '{{__comments__}',
    makeCommet(newsContent.comments)
  );
}

function router() {
  const routePath = window.location.hash;

  if (routePath === '') {
    newsFeed();
  } else if (routePath.indexOf('#/page') >= 0) {
    store.currentPage = Number(location.hash.split('/')[2]);
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', router);

router();
