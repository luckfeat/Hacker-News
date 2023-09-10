import { NewsFeed, NewsDetail } from '../types';
import { NEWS_URL, CONTENT_URL } from '../config';

export class Api {
  xhr: XMLHttpRequest;
  url: string;

  constructor(url: string) {
    this.xhr = new XMLHttpRequest();
    this.url = url;
  }

  getRequestWithXhr<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
    this.xhr.open('GET', this.url);
    this.xhr.addEventListener('load', () => {
      cb(JSON.parse(this.xhr.response) as AjaxResponse);
    });
    this.xhr.send();
  }

  getRequestWithPromise<AjaxResponse>(cb: (data: AjaxResponse) => void): void {
    fetch(this.url)
      .then((response) => response.json())
      .then(cb)
      .catch(() => {
        console.error('데이터를 불러오지 못했습니다.');
      });
  }
}

export class NewsFeedApi extends Api {
  constructor(url: string) {
    super(url);
  }
  getData(cb: (data: NewsFeed[]) => void): void {
    return this.getRequestWithXhr<NewsFeed[]>(cb);
  }
  getDataWithPromise(cb: (data: NewsFeed[]) => void): void {
    return this.getRequestWithPromise<NewsFeed[]>(cb);
  }
}

export class NewsDetailApi extends Api {
  constructor(url: string) {
    super(url);
  }
  getData(cb: (data: NewsDetail) => void): void {
    return this.getRequestWithXhr<NewsDetail>(cb);
  }
  getDataWithPromise(cb: (data: NewsDetail) => void): void {
    return this.getRequestWithPromise<NewsDetail>(cb);
  }
}
