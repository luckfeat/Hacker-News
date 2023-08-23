const ajax = new XMLHttpRequest();
const URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const root = document.querySelector('#root');
const div = document.createElement('div');

ajax.open('GET', URL, false);
ajax.send();

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul');

window.addEventListener('hashchange', () => {
  const id = window.location.hash.substring(1);
  ajax.open('GET', CONTENT_URL.replace('@id', id), false);
  ajax.send();

  const newsContent = JSON.parse(ajax.response);
  const title = document.createElement('h1');
  title.innerHTML = newsContent.title;
  div.append(title);
});

for (let i = 0; i < newsFeed.length; i++) {
  const li = document.createElement('li');
  const a = document.createElement('a');

  a.href = `#${newsFeed[i].id}`;
  a.innerHTML = `${newsFeed[i].title} (${newsFeed[i].comments_count})`;

  li.appendChild(a);
  ul.appendChild(li);
}

root.appendChild(ul);
root.appendChild(div);
