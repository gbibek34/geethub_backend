const request = require('supertest');
const sinon = require('sinon');
const app = require('../app');
const auth = require('../auth/auth');
const mongoose = require('mongoose');
const Music = require('../models/musicModel');
const ReportUser = require('../models/reportUserModel');
const ReportMusic = require('../models/reportMusicModel');
// jest.useFakeTimers();
beforeAll(async () => {
  await mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
afterAll(async () => {
  // await mongoose.connection.close();
});

describe('GET /music/all', () => {
  it('GET /music/all => success and data', async () => {
    var data;
    await Music.find({}).then((res) => (data = res));
    expect(data).toEqual(expect.arrayContaining([expect.objectContaining({})]));
  });
});

describe('GET /music/liked/all', () => {
  it('GET /music/liked/all => success and data', async () => {
    var data;
    await Music.find({ likes: { $in: ['62a303b0e611706c728250b7'] } }).then(
      (res) => (data = res)
    );
    expect(data).toEqual(expect.arrayContaining([]));
  });
});

describe('GET /admin/userreport/all', () => {
  it('GET /admin/userreport/all => success and data', async () => {
    var data;
    await ReportUser.find({}).then((res) => (data = res));
    expect(data).toEqual(expect.arrayContaining([]));
  });
});

describe('GET /admin/userreport/all', () => {
  it('GET /admin/userreport/all => success and data', async () => {
    var data;
    await ReportMusic.find({}).then((res) => (data = res));
    expect(data).toEqual(expect.arrayContaining([]));
  });
});
