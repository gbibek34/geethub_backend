const request = require('supertest');
const sinon = require('sinon');

const app = require('../app');

describe('POST /login', () => {
  it('POST /login => token and success', () => {
    return request(app)
      .post('/login')
      .send({ email: 'goyaladitya85@gmail.com', password: 'softwarica12' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            success: true,
            token: expect.any(String),
          })
        );
      });
  });
});
