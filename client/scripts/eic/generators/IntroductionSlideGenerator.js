define([ 'lib/jquery',
    'eic/generators/CombinedSlideGenerator',
    'eic/generators/TitleSlideGenerator',
    'eic/generators/FBProfilePhotosGenerator',
    'eic/generators/GoogleImageSlideGenerator',
    'eic/generators/GoogleMapsSlideGenerator',
    'eic/FacebookConnector', 'eic/TTSService'],
function ($, CombinedSlideGenerator, TitleSlideGenerator, FBProfilePhotosGenerator,
          GoogleImageSlideGenerator, GoogleMapsSlideGenerator, FacebookConnector, TTSService) {

  "use strict";

  /** Generator that creates introductory slides */
  function IntroductionSlideGenerator(startTopic) {
    if (startTopic.type !== 'facebook')
      throw "The IntroductionSlideGenerator only works with topics that are Facebook profiles.";
    
    CombinedSlideGenerator.call(this);
    this.slides = [];
    this.startTopic = startTopic;
  }

  $.extend(IntroductionSlideGenerator.prototype,
           CombinedSlideGenerator.prototype,
  {
      init: function () {
        if (!this.inited) {
          this.fetchTopicInformation(this.createIntroSlideGenerators);
          this.inited = true;
        }
      },
      
      next: function () {
        var slide = CombinedSlideGenerator.prototype.next.apply(this);
        if (this.audioURL) {
          slide.audioURL = this.audioURL;
          delete this.audioURL;
        }
        return slide;
      },
      
      fetchTopicInformation: function (callback) {
        var self = this,
            profile = this.startTopic;
        profile.genderType = this.startTopic.gender === 'male' ? 'man' : 'woman';
        profile.relativePronoun = this.startTopic.gender === 'male' ? 'he' : 'she';
        profile.fullHometown = profile.hometown.name;
        profile.shortHometown = profile.fullHometown.replace(/,.+$/, '');
        
        new FacebookConnector().get('music', function (response) {
          profile.music = response.data[0].name;
          callback.call(self);
        });
      },
      
      createIntroSlideGenerators: function () {
        var startTopic = this.startTopic,
            self = this;
        
        this.createSpeech();
        
        [
          new TitleSlideGenerator("Everything Is Connected"),
          new FBProfilePhotosGenerator(3),
          new TitleSlideGenerator("Everything Is Connected"),
        ]
        .forEach(function (generator) {
          self.addGenerator(generator)
        });
        /*
        this.addGenerator(new GoogleImageSlideGenerator("earth", 2));
        this.addGenerator(new TitleSlideGenerator("... It's filled with data and things ..."));
        this.addGenerator(new GoogleImageSlideGenerator("earth luminous network", 2));
        this.addGenerator(new TitleSlideGenerator("... and EVERYTHING IS CONNECTED"));
        this.addGenerator(new TitleSlideGenerator("Don't believe me? I will show you."));
        this.addGenerator(new TitleSlideGenerator("Once upon a time, " + startTopic.name + " ..."));
        this.addGenerator(new TitleSlideGenerator("... a " + startTopic.genderType +
                                                  " from " + startTopic.fullHometown + " ..."));
        this.addGenerator(new GoogleMapsSlideGenerator(startTopic.fullHometown));
        this.addGenerator(new GoogleImageSlideGenerator(startTopic.shortHometown));
        */
      },
      
      createSpeech: function () {
        var startTopic = this.startTopic,
            tts = new TTSService(),
            self = this;
        
        var text = "Once upon a time, " +
                   startTopic.first_name + "wondered how " +
                   startTopic.relativePronoun + " was connected to everything in this world. ";
        
        tts.getSpeech(text, 'en_GB', function (response) {
          self.audioURL = response.snd_url;
        });
      },
    });

  return IntroductionSlideGenerator;
});