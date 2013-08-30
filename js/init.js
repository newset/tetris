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

Player = Nimbus.Model.setup('Player', ['userid', 'name', 'role', 'online', 'board', 'piece', 'restart']);

Player.prototype.child = function(key) {
  var i, keys, players, result;
  key = key.toString();
  players = Player.all();
  keys = key.split('/');
  i = 0;
  while (i < keys.length) {
    result = result[keys[i]];
  }
  return result;
};

Nimbus.Auth.set_app_ready(function() {
  if (Nimbus.Auth.authorized()) {
    Nimbus.Share.get_me(function(me) {
      var player;
      me.role = 'owner';
      fill_player(me);
      player = Player.findByAttribute('userid', me.id);
      return new Tetris.Controller(player);
    });
    return Player.sync_all(function() {
      return console.log('players synced');
    });
  }
});

window.set_player = function(data) {
  var player;
  player = Player.findByAttribute('userid', data.id);
  if (!player) {
    player = Player.create();
    player.email = data.email;
    player.role = data.role;
    player.userid = data.id;
    player.name = data.name;
  }
  player.online = true;
  return player.save();
};

window.fill_player = function(user) {
  var writer;
  user.online = true;
  if (user.role === 'owner') {
    return set_player(user);
  } else if (user.role === 'writer') {
    writer = Player.findByAttribute('role', 'writer');
    if (!writer || !writer.online) {
      return set_player(user);
    }
  } else {
    return console.log('error' + JSON.stringify(user));
  }
};

$(function() {
  console.log('ready');
  $('a#login').click(function() {
    console.log('auth start...');
    return Nimbus.Auth.authorize('GDrive');
  });
  $('#invite').click(function() {
    var email;
    email = $('invite_email').val();
    return Nimbus.Share.add_share_user_real(email, function(user) {
      return fill_player(user);
    });
  });
  return true;
});
