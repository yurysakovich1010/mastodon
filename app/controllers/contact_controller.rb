# frozen_string_literal: true

class ContactController < ApplicationController
  layout 'brighteon_social_public'

  before_action :set_instance_presenter

  def index
    @contact = Contact.new
  end

  def create
    @contact = Contact.new(resource_params)

    if @contact.save
      @saved = @contact
      @contact = Contact.new
      render :index
    else
      render :index
    end

    ContactMailer.new_contact(@saved.feedback).deliver_now
  end

  private

  def resource_params
    params.require(:contact).permit(:feedback)
  end

  def set_instance_presenter
    @instance_presenter = InstancePresenter.new
  end
end
