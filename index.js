/** @jsx React.DOM */

/**
 * Module dependencies
 */

var React = require('react');
var sdk = require('require-sdk')('https://www.youtube.com/iframe_api', 'YT');
var loadTrigger = sdk.trigger();

// YT API requires global ready event handler
window.onYouTubeIframeAPIReady = function () {
  loadTrigger();
  delete window.onYouTubeIframeAPIReady;
};

module.exports = React.createClass({
  getInitialState: function() {
    return {
      player: undefined,
      url: undefined
    };
  },

  componentDidMount: function() {
    var _this = this;

    sdk(function(err, youtube) {
      var player = new youtube.Player('yt-player', {
        videoId: getVideoId(_this.props.url),
        events: {
          'onStateChange': _this._handlePlayerStateChange
        }
      });

      _this.setState({player: player, url: _this.props.url});
    });
  },

  componentDidUpdate: function() {
    if (this.props.url !== this.state.url) {
      this._loadNewUrl();
    }
  },

  _loadNewUrl: function() {
    if (this.props.autoplay) {
      this.state.player.loadVideoById(getVideoId(this.props.url));
    } else {
      this.state.player.cueVideoById(getVideoId(this.props.url));
    }
  },

  _handlePlayerStateChange: function(event) {
    var handler;
    switch(event.data) {
      case 0: 
        handler = this.props.ended || noop;
        handler();
        break;

      case 1:
        handler = this.props.playing || noop;
        handler();
        break

      case 2:
        handler = this.props.stopped || noop;
        handler();
        break;

      default: 
        return;
    }
  },

  render: function() {
    return (
      <div id='yt-player'></div>
    );
  }
});

function noop() {};

/**
 * Separates video ID from valid YouTube URL
 *
 * @param {string} url
 * @return {string}
 */

function getVideoId(url) {
  var regex = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/;
  if (url) return url.match(regex)[5];
}