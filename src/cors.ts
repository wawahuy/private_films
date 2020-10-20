const corsHeaders = {
  origin: [
    'http://localhost:8100',
    'https://phim-api-staging.giayuh.com',
    'https://phim-staging.giayuh.com'
  ],
  headers: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type'],
  credentials: true,
  additionalHeaders: [
    'username',
    'cache-control',
    'access-control-allow-headers',
    'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, CORRELATION_ID'
  ],
  additionalExposedHeaders: [
    'username',
    'access-control-allow-headers',
    'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, CORRELATION_ID'
  ]
};

export default corsHeaders;
