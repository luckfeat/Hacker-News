import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment } from '../types';
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
                <a href="#/page/${store.currentPage}" class="text-gray-500">
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
  constructor(containerId: string) {
    super(containerId, template);
  }

  render() {
    const id = window.location.hash.split('/')[2];
    const api = new NewsDetailApi();
    const newsContent = api.getData(id);
    const readNews = store.feeds.find((item) => {
      return item.id === Number(id);
    });

    if (readNews) {
      readNews.read = true;
    }

    this.setTemplateData('comments', this.makeCommet(newsContent.comments));
    this.setTemplateData('title', newsContent.title);
    this.setTemplateData('content', newsContent.content);
    this.updateView();
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
