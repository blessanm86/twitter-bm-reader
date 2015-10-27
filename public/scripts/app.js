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
      var profileImage = tweet.user.profile_image_url;
      var profileName = tweet.user.name + '(@' + tweet.user.screen_name + ')';
      var tweetMarkup = tweet.html;

      return `<li class="brm-list-item">

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
  });


}

function fetchData(url, callback) {
  return fetch(url, {
    method: 'get'
  })
  .then(function(response) {
    return response.json();
  })
  .then(callback)
  .catch(function(err) {
    console.log(err);
  });
}

