# frozen_string_literal: true

# == Schema Information
#
# Table name: contacts
#
#  id         :bigint(8)        not null, primary key
#  feedback   :string           default(""), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Contact < ApplicationRecord
end
