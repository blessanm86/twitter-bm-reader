getProfile();

function getProfile() {
  fetchData('profile', function(profile) {
    document.querySelector('.bmr-header .avatar').setAttribute('src', profile.profile_image_url);
    document.querySelector('.bmr-header .author-name').innerHTML = profile.name + '(@' + profile.screen_name + ')';
    getTweets();
  });
}

function getTweets() {
  fetchData('tweets', function(tweets) {
    tweets = tweets.map(function(tweet) {
      if(tweet.retweeted_status) {
        var tweetId = tweet.retweeted_status.id_str;
        var username = tweet.retweeted_status.user.screen_name;
        var profileImage = tweet.retweeted_status.user.profile_image_url;
        var profileName = tweet.retweeted_status.user.name + '(@' + tweet.retweeted_status.user.screen_name + ')';
      } else {
        var tweetId = tweet.id_str;
        var username = tweet.user.screen_name;
        var profileImage = tweet.user.profile_image_url;
        var profileName = tweet.user.name + '(@' + tweet.user.screen_name + ')';
      }
      var tweetMarkup = tweet.html;

      return `<li class="brm-list-item" data-id="${tweetId}" data-username="${username}">

        <div class="bookmark"></div>

        <div class="brm-tweet-author">
          <img class="avatar" src="${profileImage}"/>
          <h4 class="author-name">${profileName}</h4>
          <span class="time-difference">3h</span>
        </div>

        <div class="brm-tweet-text">${tweetMarkup}</div>
      </li>`;
    });

    document.querySelector('.bmr-tweet-list').innerHTML = tweets.join('');
    document.querySelector('.uil-squares-css').hidden = true;

    setupEventListeners();
  });
}

function fetchData(url, callback) {
  return fetch(url, {
    method: 'get',
    credentials: 'same-origin'
  })
  .then(function(response) {
    return response.json();
  })
  .then(callback)
  .catch(function(err) {
    console.log('Fetch Err');
    console.log(err);
  });
}

function setupEventListeners() {
  var list = document.querySelector('.bmr-tweet-list');
  var iframe = document.querySelector('.bmr-tweet-page');

  list.addEventListener('click', function(event) {
    var target = event.target; // Clicked element
    while (target && target.parentNode !== list) {
        target = target.parentNode; // If the clicked element isn't a direct child
        if(!target) { return; } // If element doesn't exist
    }
    //console.log(target);
    if (target.tagName === 'LI'){
        var id = target.getAttribute('data-id');
        var username = target.getAttribute('data-username');
        //iframe.setAttribute('src', `https://twitter.com/${username}/status/${id}`); //Cant be done to frameblocker
        window.open(`https://twitter.com/${username}/status/${id}`, '_blank');
    }
  });
}

