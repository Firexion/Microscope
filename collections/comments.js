Comments = new Meteor.Collection('comments');

Meteor.methods({
  comment: function(commentAttributes) {
    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);
    
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to make comments")
    
    // ensure comment has content
    if (!commentAttributes.body)
      throw new Meteor.Error(422, "Please write some content");
    
    // ensure comment is on a post
    if (!post)
      throw new Meteor.Error(422, "You must comment on a post");
    
    comment = _.extend(_.pick(commentAttributes, 'postId', 'body'), {
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });
    
    // create the comment. Save the id
    comment._id = Comments.insert(comment);
    
    // create a notification, informing user there's been a comment
    createCommentNotification(comment);
    
    return comment._id;
  }
})