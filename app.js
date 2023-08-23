const ajax = new XMLHttpRequest();
const URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const root = document.querySelector('#root');
const div = document.createElement('div');
const store = {
  currentPage: 1,
};

console.log(store.currentPage);

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function newsFeed() {
  const newsFeed = getData(URL);
  const newsList = [];

  newsList.push('<ul>');
  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(/* html */ `
        <li>
          <a href="#/detail/${newsFeed[i].id}"
            >${newsFeed[i].title} (${newsFeed[i].comments_count})</a
          >
        </li>
      `);
  }
  newsList.push('</ul>');

  let pagination = '<div>';
  if (store.currentPage > 1) {
    pagination += `<a href="#/page/${store.currentPage - 1}">이전</a>`;
  }
  if (store.currentPage < newsFeed.length / 10) {
    pagination += `<a href="#/page/${store.currentPage + 1}">다음</a>`;
  }
  pagination += '</div>';

  newsList.push(pagination);

  root.innerHTML = newsList.join('');
}

function newsDetail() {
  const id = window.location.hash.split('/')[2];
  console.log(id);
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  root.innerHTML = /* html */ `
          <h1>${newsContent.title}</h1>
          <div>
              <a href="#/page/${store.currentPage}">목록으로</a>
          </div>
          `;
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
