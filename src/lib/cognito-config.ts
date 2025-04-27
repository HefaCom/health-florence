
// AWS Cognito Configuration
export const awsConfig = {
  Auth: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_wkBO2vhgV',
    userPoolWebClientId: '47vqu3h40rupic70jnji8v9jph',
    oauth: {
      domain: 'your-cognito-domain.auth.us-east-2.amazoncognito.com', // Replace with your Cognito domain
      scope: ['phone', 'email', 'openid', 'profile'],
      redirectSignIn: window.location.origin,
      redirectSignOut: window.location.origin,
      responseType: 'code'
    }
  }
};
