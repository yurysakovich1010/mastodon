require 'omniauth-oauth2'

module OmniAuth
  module Strategies
    class Brighteon < OmniAuth::Strategies::OAuth2
      option :client_options, {
        site: ENV['BRIGHTEON_AUTH_URL'],
        authorize_url: 'authorize'
      }
      
      uid { raw_info['user']['username'] }

      info do
        {
          name: raw_info['user']['username'],
          email: raw_info['user']['email'],
          verified_email: raw_info['user']['email'],
          full_name: raw_info['user']['fullName'],
        }
      end


      def build_access_token
        ::OAuth2::AccessToken.from_hash(client, access_token: request.params['access_token'])
      end

      def raw_info
        @raw_info ||= access_token.get(ENV['BRIGHTEON_USER_INFO_URL']).parsed
      end

      def request_phase
        redirect client.auth_code.authorize_url({ :redirect_uri => callback_url, audience: full_host }.merge(options.authorize_params))
      end

      def callback_url
        full_host + script_name + callback_path + '/from_js'
      end
    end
  end
end
