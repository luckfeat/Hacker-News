import View from '../core/view';
import { NewsFeedApi } from '../core/api';
import { NewsFeed, NewsStore } from '../types';
import { NEWS_URL } from '../config';

const template: string = /* html */ `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold"><a href='#'>Hacker News</a></h1>
            </div>
            <div class="pagination items-center justify-end">
              <a class="prev text-gray-500">
              </a>
              <a class="next text-gray-500 ml-4">
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__feed__}}        
      </div>
    </div>
  `;

export default class NewsFeedView extends View {
  private api: NewsFeedApi;
  private store: NewsStore;
  constructor(containerId: string, store: NewsStore) {
    super(containerId, template);
    this.api = new NewsFeedApi();
    this.store = store;
    if (!this.store.hasFeeds) {
      this.store.setFeeds(this.api.getData());
    }
  }

  render() {
    this.store.currentPage = Number(location.hash.substring(7) || 1);
    for (
      let i = (this.store.currentPage - 1) * 10;
      i < this.store.currentPage * 10;
      i++
    ) {
      const { read, id, title, comments_count, user, points, time_ago } =
        this.store.getFeed(i);
      this.addHTML(`
      <div class="p-6 ${
        read ? 'bg-red-500' : 'bg-white'
      } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${id}">${title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${user}</div>
            <div><i class="fas fa-heart mr-1"></i>${points}</div>
            <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
    }

    this.setTemplateData('feed', this.getHTML());
    this.updateView();

    const pagination = document.querySelector('.pagination');
    const prevAnchor = document.querySelector('.prev');
    const nextAnchor = document.querySelector('.next');

    if (this.store.currentPage > 1) {
      const prev = document.createElement('a');
      prev.innerHTML = `<a href="#/page/${
        this.store.currentPage - 1
      }">Prev</a>`;
      if (prevAnchor) {
        pagination
          ? pagination.replaceChild(prev, prevAnchor)
          : console.error('요소를 찾을 수 없습니다.');
      } else {
        console.error('이전 페이지 요소를 찾을 수 없습니다.');
      }
    }

    if (this.store.currentPage < this.store.numberOfFeed / 10) {
      const next = document.createElement('a');
      next.innerHTML = `<a href="#/page/${
        this.store.currentPage + 1
      }">Next</a>`;
      if (nextAnchor) {
        pagination
          ? pagination.replaceChild(next, nextAnchor)
          : console.error('요소를 찾을 수 없습니다.');
      } else {
        console.error('다음 페이지 요소를 찾을 수 없습니다.');
      }
    }
  }
}
