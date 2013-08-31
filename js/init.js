// Generated by CoffeeScript 1.6.3
var Player, sync;

sync = {
  'GDrive': {
    'key': '361504558285.apps.googleusercontent.com',
    "scope": "https://www.googleapis.com/auth/drive",
    "app_name": "tetris"
  }
};

Nimbus.Auth.setup(sync);

window.realtime_update_callback = function() {
  return console.log('updated...');
};

Player = Nimbus.Model.setup('Player', ['userid', 'name', 'online', 'board', 'piece', 'restart']);

Player.prototype.child = function(key) {
  var i, keys, result;
  key = key.toString();
  result = Player.all();
  keys = key.split('/');
  i = 0;
  while (i < keys.length) {
    result = result[keys[i]];
    i++;
  }
  return result;
};

Nimbus.Auth.set_app_ready(function() {
  var collabrators, data, me, one, player, _i, _j, _k, _len, _len1, _len2, _ref, _results;
  if (Nimbus.Auth.authorized()) {
    $('#login').text('Logout');
    collabrators = doc.getCollaborators();
    for (_i = 0, _len = collabrators.length; _i < _len; _i++) {
      one = collabrators[_i];
      if (one.isMe) {
        localStorage['current'] = JSON.stringify(one);
        fill_player(one);
        me = one;
      }
    }
    data = Player.findByAttribute('userid', me.userId);
    new Tetris.Controller(data);
    _ref = Player.all();
    _results = [];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      player = _ref[_j];
      player.online = false;
      for (_k = 0, _len2 = collabrators.length; _k < _len2; _k++) {
        one = collabrators[_k];
        if (one.userId === player.userid) {
          console.log('player ' + player.name + ' online');
          player.online = true;
        }
        player.save();
        break;
      }
      _results.push(player.save());
    }
    return _results;
  }
});

window.set_player = function(data, target) {
  var player;
  player = Player.findByAttribute('userid', data.userId);
  if (!player) {
    player = Player.create();
    player.email = data.email;
    player.userid = data.userId;
    player.name = data.displayName;
  }
  player.online = true;
  return player.save();
};

window.fill_player = function(user) {
  var player, players, _i, _len;
  players = Player.all();
  if (players.length < 2) {
    set_player(user);
    return;
  }
  for (_i = 0, _len = players.length; _i < _len; _i++) {
    player = players[_i];
    if (player.userid === user.userId) {
      player.online = true;
      player.save();
      return;
    } else if (!player.online) {
      player.destroy();
      set_player(user);
      return;
    }
  }
  return console.log('waiting...');
};

$(function() {
  $('a#login').click(function() {
    console.log('auth start...');
    Nimbus.Auth.authorize('GDrive');
    return false;
  });
  $('#invite').click(function() {
    var email;
    email = $('#invite_email').val();
    Nimbus.Share.add_share_user_real(email, function(user) {
      return fill_player(user);
    });
    return false;
  });
  return true;
});
