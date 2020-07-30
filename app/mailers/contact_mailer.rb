# frozen_string_literal: true

class ContactMailer < ApplicationMailer
  layout 'plain_mailer'

  def new_contact(content)
    @content  = content
    @me       = User.where(admin: true).first
    # @instance = Rails.configuration.x.local_domain

    I18n.with_locale(@me.locale || I18n.default_locale) do
      mail to: 'support@brighteon.com', subject: I18n.t('contact_mailer.new_contact.subject'), content: @content
    end
  end
end
