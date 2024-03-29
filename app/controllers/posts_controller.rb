class PostsController < ApplicationController
  before_action :set_post, only: [:show, :update, :destroy]
  before_action :authorize_user, only: [:update, :destroy]
  before_action :authorize_vote, only: [:upvote, :downvote]

  def index
    posts = Post.all.order(points: :desc)
    render json: posts, status: :ok
  end

  def create
    # post_params
    post = Post.create(
      # title: params[:title],
      post_params
      # text: params[:text],
      # image_url: params[:image_url],
      # community_id: params[:community_id],
      # points: params[:points]
    )
    if post.valid?
      post.post_votes.create(user_id: current_user.id, points: params[:points])
      render json: post, status: :created
    else
      render json: { error: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def popular
    # posts = Posts.all
    # search all posts for comments with 5+ points
    # return all posts above

    # Comments.all
    # comments with 5+ points
    # posts related to those comments
    # unique posts 

    # Comments.all
    # taking the sum of comment votes for each comment
    # grab all comments with 5+ points 
    # get all posts related to those comments
    # return posts

    # self.object.comment_votes.sum { |votes| votes[:points] }


    all_comments = Comment.all
    popular_comments = all_comments.select { |comment| comment.points >= 1 }
    posts = popular_comments.map { |comment| comment.post }
    render json: posts, status: :created
    # byebug

  end

  def destroy
    post = Post.find(params[:id])
    post.destroy
  end

  def upvote
    post = Post.find(params[:post_id])
    post_vote_array = post.post_votes.select { |vote| current_user.id == vote.user_id }
    post_vote = post_vote_array[0]
    if post_vote_array.length > 0 && post_vote.points == 1
      post_vote.update(points: 0)
      render json: { update: "unvoted" }, status: :accepted
    elsif post_vote_array.length > 0 && post_vote.points == 0
      post_vote.update(points: 1)
      render json: { update: "upvoted" }, status: :accepted
    elsif post_vote_array.length > 0 && post_vote.points == -1
      post_vote.update(points: 1)
      render json: { update: "upvoted" }, status: :accepted
    else
      post.post_votes.create(user_id: current_user.id, points: params[:points])
      render json: post, status: :accepted
    end
  end

  def downvote
    post = Post.find(params[:post_id])
    post_vote_array = post.post_votes.select { |vote| current_user.id == vote.user_id }
    post_vote = post_vote_array[0]
    if post_vote_array.length > 0 && post_vote.points == 1
      post_vote.update(points: -1)
      render json: { update: "downvoted" }, status: :accepted
    elsif post_vote_array.length > 0 && post_vote.points == 0
      post_vote.update(points: -1)
      render json: { update: "downvoted" }, status: :accepted
    elsif post_vote_array.length > 0 && post_vote.points == -1
      post_vote.update(points: 0)
      render json: { update: "unvoted" }, status: :accepted
    else
      post.post_votes.create(user_id: current_user.id, points: params[:points])
      render json: post, status: :accepted
    end
  end

  private

  def post_params
    # binding.pry
    params.permit(:title, :text, :image_url, :community_id)
  end

  def set_post
    @post = Post.find(params[:id])
  end

  def authorize_user
    user_can_modify = current_user.try(:admin)
    render json: { error: "You don't have permission to perform that action." }, status: :forbidden unless user_can_modify
  end

  def authorize_vote
    user_can_modify = !session[:user_id].nil?
    render json: { error: "You must be logged in to vote." }, status: :forbidden unless user_can_modify
  end

end