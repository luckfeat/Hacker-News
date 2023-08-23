const ajax = new XMLHttpRequest();
const URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const root = document.querySelector('#root');
const div = document.createElement('div');

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function newsFeed() {
  const newsFeed = getData(URL);
  const newsList = [];

  newsList.push('<ul>');
  for (let i = 0; i < newsFeed.length; i++) {
    newsList.push(/* html */ `
        <li>
          <a href="#${newsFeed[i].id}"
            >${newsFeed[i].title} (${newsFeed[i].comments_count})</a
          >
        </li>
      `);
  }
  newsList.push('</ul>');

  root.innerHTML = newsList.join('');
}

function newsDetail() {
  const id = window.location.hash.substring(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id));

  root.innerHTML = /* html */ `
          <h1>${newsContent.title}</h1>
          <div>
              <a href="#">목록으로</a>
          </div>
          `;
}

function router() {
  const routePath = window.location.hash;

  if (routePath === '') {
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', router);
router();
