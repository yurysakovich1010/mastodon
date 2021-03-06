# frozen_string_literal: true

class AccountsController < ApplicationController
  PAGE_SIZE     = 20
  PAGE_SIZE_MAX = 200

  include AccountControllerConcern
  include SignatureAuthentication

  layout 'brighteon_social_profile'

  before_action :require_signature!, if: -> { request.format == :json && authorized_fetch_mode? }
  before_action :set_cache_headers
  before_action :set_body_classes

  skip_around_action :set_locale, if: -> { [:json, :rss].include?(request.format&.to_sym) }
  skip_before_action :require_functional!, unless: :whitelist_mode?

  def show
    respond_to do |format|
      format.html do
        expires_in 0, public: true unless user_signed_in?

        @pinned_statuses   = []
        @endorsed_accounts = @account.endorsed_accounts.to_a.sample(4)
        @featured_hashtags = @account.featured_tags.order(statuses_count: :desc)

        if current_account && @account.blocking?(current_account)
          @statuses = []
          return
        end

        @pinned_statuses = cache_collection(@account.pinned_statuses, Status) if show_pinned_statuses?
        @statuses        = filtered_status_page
        @statuses        = cache_collection(@statuses, Status)
        @rss_url         = rss_url

        unless @statuses.empty?
          @older_url = older_url if @statuses.last.id > filtered_statuses.last.id
          @newer_url = newer_url if @statuses.first.id < filtered_statuses.first.id
        end
      end

      format.rss do
        expires_in 1.minute, public: true

        limit     = params[:limit].present? ? [params[:limit].to_i, PAGE_SIZE_MAX].min : PAGE_SIZE
        @statuses = filtered_statuses.without_reblogs.reorder(id: :desc).limit(limit)
        @statuses = cache_collection(@statuses, Status)
        render xml: RSS::AccountSerializer.render(@account, @statuses, params[:tag])
      end

      format.json do
        expires_in 3.minutes, public: !(authorized_fetch_mode? && signed_request_account.present?)
        render_with_cache json: @account, content_type: 'application/activity+json', serializer: ActivityPub::ActorSerializer, adapter: ActivityPub::Adapter
      end
    end
  end

  private

  def set_body_classes
    @body_classes = 'with-modals profile'
  end

  def show_pinned_statuses?
    [replies_requested?, media_requested?, photos_requested?, videos_requested?, tag_requested?, params[:max_id].present?, params[:min_id].present?].none?
  end

  def filtered_statuses
    default_statuses.tap do |statuses|
      statuses.merge!(hashtag_scope)    if tag_requested?
      statuses.merge!(only_videos_scope) if videos_requested?
      statuses.merge!(only_photos_scope) if photos_requested?
      statuses.merge!(only_media_scope) if media_requested?
      statuses.merge!(replies_scope) if replies_requested?
      statuses.merge!(no_replies_scope) unless replies_requested?
    end
  end

  def default_statuses
    @account.statuses.where(visibility: [:public, :unlisted])
  end

  def only_media_scope
    Status.where(id: account_media_status_ids)
  end

  def only_photos_scope
    Status.where(id: account_photos_status_ids)
  end

  def only_videos_scope
    Status.where(id: account_videos_status_ids)
  end

  def account_media_status_ids
    @account.media_attachments.attached.reorder(nil).select(:status_id).distinct
  end

  def account_photos_status_ids
    @account.media_attachments.image_type.attached.reorder(nil).select(:status_id).distinct
  end

  def account_videos_status_ids
    @account.media_attachments.video_type.attached.reorder(nil).select(:status_id).distinct
  end

  def no_replies_scope
    Status.without_replies
  end

  def replies_scope
    Status.with_replies
  end

  def hashtag_scope
    tag = Tag.find_normalized(params[:tag])

    if tag
      Status.tagged_with(tag.id)
    else
      Status.none
    end
  end

  def username_param
    params[:username]
  end

  def rss_url
    if tag_requested?
      short_account_tag_url(@account, params[:tag], format: 'rss')
    else
      short_account_url(@account, format: 'rss')
    end
  end

  def older_url
    pagination_url(max_id: @statuses.last.id)
  end

  def newer_url
    pagination_url(min_id: @statuses.first.id)
  end

  def pagination_url(max_id: nil, min_id: nil)
    if tag_requested?
      short_account_tag_url(@account, params[:tag], max_id: max_id, min_id: min_id)
    elsif media_requested?
      short_account_media_url(@account, max_id: max_id, min_id: min_id)
    elsif photos_requested?
      short_account_photos_url(@account, max_id: max_id, min_id: min_id)
    elsif videos_requested?
      short_account_videos_url(@account, max_id: max_id, min_id: min_id)
    elsif replies_requested?
      short_account_with_replies_url(@account, max_id: max_id, min_id: min_id)
    else
      short_account_url(@account, max_id: max_id, min_id: min_id)
    end
  end

  def media_requested?
    request.path.split('.').first.ends_with?('/media') && !tag_requested?
  end

  def videos_requested?
    request.path.split('.').first.ends_with?('/videos') && !tag_requested?
  end

  def photos_requested?
    request.path.split('.').first.ends_with?('/photos') && !tag_requested?
  end

  def replies_requested?
    request.path.split('.').first.ends_with?('/with_replies') && !tag_requested?
  end

  def tag_requested?
    request.path.split('.').first.ends_with?(Addressable::URI.parse("/tagged/#{params[:tag]}").normalize)
  end

  def filtered_status_page
    filtered_statuses.paginate_by_id(PAGE_SIZE, params_slice(:max_id, :min_id, :since_id))
  end

  def params_slice(*keys)
    params.slice(*keys).permit(*keys)
  end
end
