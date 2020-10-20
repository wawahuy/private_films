import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import videojs, { VideoJsPlayerOptions } from 'video.js';

declare var require: any;
require('videojs-hls-quality-selector');
require('videojs-contrib-quality-levels');

interface IOptions {
  fluid?: boolean,
  aspectRatio?: string,
  autoplay?: boolean,
  sources?: {
      src: string,
      type: string,
  }[],
}


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: [
    './test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit , OnDestroy {
  private static idx = 0;

  private player: videojs.Player;
  private idx;
  private options: VideoJsPlayerOptions = {
    fluid: false,
    aspectRatio: "16:9",
    autoplay: true,
    sources: [
      {
        src: 'http://localhost:8002/public/decode2/test/playlist.m3u8',
        type: 'application/x-mpegURL'
      }
    ]
  };

  constructor(private el: ElementRef, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: any) {
    this.idx = ++TestComponent.idx;
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.runOnBrowser(() => {
      this.player = videojs(document.getElementById(this.videoId), this.options, function onPlayerReady() {
        this.hlsQualitySelector();
      });
    });
  }

  ngOnDestroy(): void {
    this.runOnBrowser(() => {
      this.player.dispose();
    })
  }

  get videoId(): string {
    return 'video_idx_' + this.idx;
  }

  private runOnBrowser(f: () => any) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(f);
    }
  }
}
