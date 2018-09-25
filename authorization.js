module.exports.login = function(request, response, next) {
    passport.authenticate('local',
      function(err, user, info) {
        return err 
          ? next(err)
          : user
            ? request.logIn(user, function(err) {
                return err
                  ? next(err)
                  : response.redirect('/private');
              })
            : response.redirect('/');
      }
    )(request, res, next);
  };