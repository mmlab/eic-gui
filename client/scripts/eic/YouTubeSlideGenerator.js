define(['lib/jquery', 'eic/BaseSlideGenerator'],
function ($, BaseSlideGenerator) {
  "use strict";

  var defaultDuration = 5000;

  /** Generator of images slides from Google Image search results.
   * Parameters: a topic and the maximum number of results to return
   */
  function YouTubeSlideGenerator(topic, maxResults) {
    BaseSlideGenerator.call(this);
    
    if (typeof topic === "string")
      topic = { label: topic };
    
    this.topic = topic;
    this.maxResults = maxResults || 1;
    this.slides = [];
  }

  $.extend(YouTubeSlideGenerator.prototype,
           BaseSlideGenerator.prototype,
  {
		/** Checks whether any slides are left. */
		hasNext: function () {
			return this.slides.length > 0;
		},

		/** Fetches a list of images about the topic. */
		init: function () {
			if (this.inited)
				return;
			var self = this;
			$.ajax('https://gdata.youtube.com/feeds/api/videos?v=2&max-results=' + this.maxResults + '&orderby=viewCount&alt=jsonc&q=' + this.topic.label)
			.success(function (response) {
				response.data.items.forEach(function (item) {
					console.log(item);
					//TODO: avoid restricted content
					
					self.addVideoSlide(item.id);
				});
			});
			this.inited = true;
		},

    /** Advances to the next slide. */
    next: function () {
      return this.slides.shift();
    },

    /** Adds a new video slide. */
    addVideoSlide: function (videoID) {
			var $iframe = $('<iframe>');
			$iframe
			.attr('class', 'youtube-player')
			.attr('type', 'text/html')
			.attr('width', '800')
			.attr('height', '600')
			.attr('frameborder', '0')
			.attr('src', 'http://www.youtube.com/embed/' + videoID + '?autoplay=1&start=20&end=25');
			
			var slide = this.createBaseSlide('YouTube', $iframe, defaultDuration);
			this.slides.push(slide);
			this.emit('newSlides');
    },
  });

  return YouTubeSlideGenerator;
});
