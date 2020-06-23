# frozen_string_literal: true

class ContactController < ApplicationController
  layout 'brighteon_social_public'

  before_action :require_open_federation!, only: [:show, :more]
  before_action :contact_path, only: :index
  before_action :set_instance_presenter
  before_action :set_expires_in, only: [:show, :more, :terms]

  skip_before_action :require_functional!, only: [:more, :terms]

  def index
    @contact = Contact.new
  end

  def create
    @contact = Contact.new(resource_params)

    if @contact.save
      redirect_to contact_path
    else
      render :index
    end
  end

  helper_method :display_blocks?
  helper_method :display_blocks_rationale?
  helper_method :public_fetch_mode?
  helper_method :new_contact
  helper_method :send_message
  helper_method :contacts_path

  private

  def resource_params
    params.require(:contact).permit(:feedback)
  end

  def set_instance_presenter
    @instance_presenter = InstancePresenter.new
  end

  def set_body_classes
    @hide_navbar = false
  end

  def set_expires_in
    expires_in 0, public: true
  end

  def send_message
    'Send'
  end

  def contacts_path
    '/contacts'
  end

  def contact_path
    '/contact'
  end
end
