class ResetAllMediaAttachmentsCacheCounters < ActiveRecord::Migration[5.2]
  def up
    Status.all.each do |status|
      Status.reset_counters(status.id, :media_attachments)
    end
  end
  def down
    # no rollback needed
  end
end
