import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment, NewsStore } from '../types/index';
import { CONTENT_URL } from '../config';

const template = /* html */ `
  <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold"><a href='#'>Hacker News</a></h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{__currentPage__}}" class="text-gray-500">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4 ">
      <h2>{{__title__}}</h2>
      <div class="text-gray-400 h-20">
        {{content}}
      </div>

      {{__comments__}}

    </div>
  </div>
`;

export default class NewsDetailView extends View {
  private store: NewsStore;

  constructor(containerId: string, store: NewsStore) {
    super(containerId, template);
    this.store = store;
  }

  render() {
    const id = window.location.hash.split('/')[2];
    const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    api.getDataWithPromise((data: NewsDetail) => {
      this.store.makeRead(Number(id));
      this.setTemplateData('comments', this.makeCommet(data.comments));
      this.setTemplateData('title', data.title);
      this.setTemplateData('content', data.content);
      this.setTemplateData('currentPage', this.store.currentPage.toString());
      this.updateView();
    });
  }

  makeCommet(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      this.addHTML(/* html */ `
        <div style="padding-left: ${comments[i].level * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);
      if (comments[i].comments.length > 0) {
        this.addHTML(this.makeCommet(comments[i].comments));
      }
    }

    return this.getHTML();
  }
}
