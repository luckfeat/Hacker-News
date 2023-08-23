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

const newsFeed = getData(URL);
const ul = document.createElement('ul');

window.addEventListener('hashchange', () => {
  const id = window.location.hash.substring(1);
  const newsContent = getData(CONTENT_URL.replace('@id', id));
  const title = document.createElement('h1');

  title.innerHTML = newsContent.title;

  div.append(title);
});

for (let i = 0; i < newsFeed.length; i++) {
  const div = document.createElement('div');

  div.innerHTML = /* html */ `
    <li>
      <a href="#${newsFeed[i].id}"
        >${newsFeed[i].title} (${newsFeed[i].comments_count})</a
      >
    </li>
  `;

  ul.appendChild(div.firstElementChild);
}

root.appendChild(ul);
root.appendChild(div);
