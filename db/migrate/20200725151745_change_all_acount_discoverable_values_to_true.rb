class ChangeAllAcountDiscoverableValuesToTrue < ActiveRecord::Migration[5.2]
  def change
    safety_assured do
      Account.update_all(discoverable: true)
    end
  end
end
