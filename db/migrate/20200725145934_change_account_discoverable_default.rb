class ChangeAccountDiscoverableDefault < ActiveRecord::Migration[5.2]
  def change
    safety_assured do
      change_column_default :accounts, :discoverable, true
      change_column_null :accounts, :discoverable, false, true
    end
  end
end
