Posts = new Meteor.Collection('posts');

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user(),
        postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    // ensure user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to post new stories');
    
    // ensure post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in the headline');
    
    // ensure there are no posts with the same url
    if (postAttributes.url && postWithSameLink)
      throw new Meteor.Error(302, 'This link has already been posted', postWithSameLink._id);
    
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime(),
      commentsCount: 0,
      upvoters: [], 
      votes: 0
    });
    
    var postId = Posts.insert(post);
    
    return postId;
  },
  upvote: function(postId) {
    var user = Meteor.user();
    
    // ensure user is logged in
    if (!user)
      throw new Meteor.Error(401, 'You need to login to upvote');
    
    var post = Posts.findOne(postId);
    if (!post)
      throw new Meteor.Error(422, 'Already upvoted this post');
    
    Posts.update({
      _id: post._id,
      upvoters: {$ne: userId}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
  }
});