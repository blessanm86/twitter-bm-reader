(function() {
  var tweetListNode, loaderNode;

  cacheSelectors();
  setupEventListeners();
  getProfile();
  getTweets();

  function cacheSelectors() {
    tweetListNode = document.querySelector('.bmr-tweet-list');
    loaderNode = document.querySelector('.uil-squares-css');
  }

  function setupEventListeners() {
    tweetListNode.addEventListener('click', function(event) {
      var url = '';
      var target = event.target; // Clicked element

      if(target.tagName === 'A') {
        //For anchor elements open their link in a new window.

        event.preventDefault();
        url = target.href;
      } else {
        //Search upto li tag.

        while (target && target.parentNode !== tweetListNode) {
          target = target.parentNode; // If the clicked element isn't a direct child
          if(!target) { return; } // If element doesn't exist
        }

        if (target.tagName === 'LI'){
          var id = target.getAttribute('data-id');
          var username = target.getAttribute('data-username');

          if(id && username) {
            url = `https://twitter.com/${username}/status/${id}`;
          } else {
            getTweets();
            return;
          }

        }
      }

      window.open(url, '_blank');
    });
  }

  function getProfile() {
    fetchData('profile').then(function(profile) {
      document.querySelector('.bmr-header .avatar').setAttribute('src', profile.profile_image_url);
      document.querySelector('.bmr-header .author-name').innerHTML = `${profile.name} (@${profile.screen_name})`;
    });
  }

  function getTweets() {
    var domParser = new DOMParser();
    var fragment = document.createDocumentFragment();

    fetchData('tweets').then(function(response) {
      if(response.tweets.length === 0) {
        alert('No more tweets at the moment. Please try again after some time.');
      } else {
        response.tweets.forEach(function(tweet) {
          var tweetMarkup = tweet.html;

          var retweetStatusClass= 'hide';
          if(tweet.retweeted_status) {
            var retweetProfileName = tweet.user.name + '(@' + tweet.user.screen_name + ')';
            retweetStatusClass = 'show';
            tweet = tweet.retweeted_status;
          }

          var tweetId = tweet.id_str;
          var username = tweet.user.screen_name;
          var profileImage = tweet.user.profile_image_url;
          var profileName = tweet.user.name + '(@' + tweet.user.screen_name + ')';
          var tweetTime = moment.duration(tweet.created_at).humanize();

          var tweetNodeStr = `<li class="bmr-list-item" data-id="${tweetId}" data-username="${username}">

            <div class="bmr-retweet-status ${retweetStatusClass}">${retweetProfileName} Retweeted</div>

            <div class="bmr-tweet-author">
              <img class="avatar" src="${profileImage}"/>
              <h4 class="author-name">${profileName}</h4>
              <span class="time-difference">${tweetTime}</span>
            </div>

            <div class="bmr-tweet-text">${tweetMarkup}</div>
          </li>`;

          fragment.appendChild(domParser.parseFromString(tweetNodeStr, "text/html").body.firstChild);
        });

        tweetListNode.insertBefore(fragment, document.querySelector('.bmr-item-next'));
      }
    });
  }

  function fetchData(url, callback) {
    loaderNode.hidden = false;

    url = location.href.replace(/\/?$/, '/') + url;

    return fetch(url, {
      method: 'get',
      credentials: 'same-origin',
      headers: new Headers({accept: 'application/json'})
    })
    .then(function(response) {
      loaderNode.hidden = true;
      if(response.status === 200) {
        return response.json();
      } else {
        return response.json().then(err => Promise.reject(err));
      }
    })
    .catch(function(err) {
      console.log(err);
      return Promise.reject(err);
    });
  }
}(window))
