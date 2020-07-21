class AddMediaAttachmentsCountToStatuses < ActiveRecord::Migration[5.2]
  def change
    add_column :statuses, :media_attachments_count, :integer
  end
end
