const GoogleAnalyticsSchema = require("../models/GoogleAnalyticsSchema");
const UserSchema = require("../models/UserSchema");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const c = require("config");
const UrlSchema = require("../models/UrlSchema");

// const clientId = '389927153738-9n3bpvcsb4barloiflhdec28s7o7q2mr.apps.googleusercontent.com';
// const clientSecret = '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';
// const scope = 'https://www.googleapis.com/auth/analytics';
// const authUrl = 'https://accounts.google.com/o/oauth2/auth';
// const accessTokenUrl = "https://accounts.google.com/o/oauth2/token";

// router.post("/ga", async (req, res) => {
//   console.log(req.body);
//   if (req.body.googleAccessToken) {
//     axios
//       .get("https://analyticsadmin.googleapis.com/v1alpha/accountSummaries", {
//         headers: {
//           Authorization: "Bearer " + req.body.googleAccessToken,
//         },
//       })
//       .then((response) => {
//         console.log(response.data);
//         return res
//           .status(200)
//           .json({ message: "Response", data: response.data });
//       });
//   } else {
//     return res.status(400).json({ message: "Bad Request" });
//   }
// });

router.post("/ga", async (req, res) => {
  const accessToken = req.body.access_token;
  const urls = await UrlSchema.find({ user: req.session.user.id });
  const gaData = await GoogleAnalyticsSchema.find({
    user: req.session.user.id,
  });
  // console.log(gaData);
  const viewIds = [];
  for (let i = 0; i < urls.length; i++) {
    for (let j = 0; j < gaData.length; j++) {
      if (urls[i].url === gaData[j].url) {
        viewIds.push({ viewId: gaData[j].profile_id, url: urls[i].url });
      }
    }
  }
  console.log(viewIds);
  // console.log(urls);
  // for (const ga of gaData){
  //   viewIds.push({url: ga.url, viewId: ga.profile_id });
  // }

  // console.log(viewIds);

  // let views = [];
  // for (let i = 0; i < viewIds.length; i++) {
  //   for (let j = 0; j < urls.length; j++){
  //     if (viewIds[i].url === urls[j].url){
  //       views.push()
  //     }
  //   }
  // }
  // console.log(data);

  // console.log(profileIds);
  // promises.push(
  //   axios(options)
  //     .then((response) => {
  //       reports.push(response.data);
  //       // console.log(response.data);
  //     })
  //     .catch((err) => {
  //       // console.log(err.message);
  //     })
  // );
  // Promise.all(promises).then(() =>{
  //   // console.log(reports);
  //   const newUrls = [];
  //   for (const profileId of profileIds){
  //     for (let i = 0; i< data.length; i++){
  //     if (profileId === data[i].profile_id){
  //       newUrls.push(data[i].url);
  //     }
  //   }
  //   }
  // console.log(newUrls);
  //   res.status(200).json({urls: newUrls, data: reports})
  // }
  // );
  const options = {
    url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
    method: "POST",
    "Content-Type": "application/json",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: {
      reportRequests: [
        {
          viewId: "283709136",
          dateRanges: [
            {
              startDate: "7daysago",
              endDate: "today",
            },
          ],
          metrics: [
            {
              expression: "ga:sessions",
            },
            {
              expression: "ga:bounces",
            },
            {
              expression: "ga:transactions",
            },
          ],
          dimensions: [{ name: "ga:date" }, { name: "ga:landingPagePath" }],
        },
      ],
    },
  };
  let report = {};
  axios(options)
    .then((response) => {
      report = response.data.reports[0];
      res.status(200).json({
        message: "ASDF",
        data: gaData,
        report: report,
        views: viewIds,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.post("/report/7", async (req, res) => {
  const accessToken = req.body.access_token;
  const givenUrl = req.body.url;
  const strippedUrl = new URL(givenUrl);
  console.log(strippedUrl);
  console.log(strippedUrl.pathname);
  // console.log(givenUrl);
  const urlsFromDb = await GoogleAnalyticsSchema.findOne({
    url: strippedUrl.origin,
  });
  if (urlsFromDb === null) {
    res
      .status(404)
      .send({
        message: "This URL is not available on your GoogleAnalytics Account",
        report: { data: {} },
      });
    return;
  }
  const viewId = urlsFromDb.profile_id;
  const options = {
    url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
    method: "POST",
    "Content-Type": "application/json",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [
            {
              startDate: "7daysago",
              endDate: "today",
            },
          ],
          metrics: [
            {
              expression: "ga:sessions",
            },
            {
              expression: "ga:bounces",
            },
            {
              expression: "ga:transactions",
            },
          ],
          dimensionFilterClauses: [
            {
              filters: [
                {
                  operator: "EXACT",
                  dimensionName: "ga:pagePath",
                  expressions: [strippedUrl.pathname],
                },
              ],
            },
          ],
          dimensions: [{ name: "ga:date" }, { name: "ga:landingPagePath" }],
        },
      ],
    },
  };
  axios(options)
    .then((response) => {
      report = response.data.reports[0];
      res.status(200).json({
        report: report,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.post("/report/14", async (req, res) => {
  const accessToken = req.body.access_token;
  const givenUrl = req.body.url;
  const strippedUrl = new URL(givenUrl);
  // console.log(givenUrl);
  const urlsFromDb = await GoogleAnalyticsSchema.findOne({
    url: strippedUrl.origin,
  });
  if (urlsFromDb === null) {
    res
      .status(404)
      .send({
        message: "This URL is not available on your GoogleAnalytics Account",
        report: { data: {} },
      });
    return;
  }
  const viewId = urlsFromDb.profile_id;
  const options = {
    url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
    method: "POST",
    "Content-Type": "application/json",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [
            {
              startDate: "14daysago",
              endDate: "today",
            },
          ],
          metrics: [
            {
              expression: "ga:sessions",
            },
            {
              expression: "ga:bounces",
            },
            {
              expression: "ga:transactions",
            },
          ],
          dimensionFilterClauses: [
            {
              filters: [
                {
                  operator: "EXACT",
                  dimensionName: "ga:pagePath",
                  expressions: [strippedUrl.pathname],
                },
              ],
            },
          ],

          dimensions: [{ name: "ga:date" }, { name: "ga:landingPagePath" }],
        },
      ],
    },
  };
  axios(options)
    .then((response) => {
      report = response.data.reports[0];
      res.status(200).json({
        report: report,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.post("/report/30", async (req, res) => {
  const accessToken = req.body.access_token;
  const givenUrl = req.body.url;

  const strippedUrl = new URL(givenUrl);
  // console.log(givenUrl);
  const urlsFromDb = await GoogleAnalyticsSchema.findOne({
    url: strippedUrl.origin,
  });
  // console.log(givenUrl);
  if (urlsFromDb === null) {
    res
      .status(404)
      .send({
        message: "This URL is not available on your GoogleAnalytics Account",
        report: { data: {} },
      });
    return;
  }
  const viewId = urlsFromDb.profile_id;
  const options = {
    url: "https://analyticsreporting.googleapis.com/v4/reports:batchGet",
    method: "POST",
    "Content-Type": "application/json",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [
            {
              startDate: "30daysago",
              endDate: "today",
            },
          ],
          metrics: [
            {
              expression: "ga:sessions",
            },
            {
              expression: "ga:bounces",
            },
            {
              expression: "ga:transactions",
            },
          ],
          dimensionFilterClauses: [
            {
              filters: [
                {
                  operator: "EXACT",
                  dimensionName: "ga:pagePath",
                  expressions: [strippedUrl.pathname],
                },
              ],
            },
          ],

          dimensions: [{ name: "ga:date" }, { name: "ga:landingPagePath" }],
        },
      ],
    },
  };
  axios(options)
    .then((response) => {
      report = response.data.reports[0];
      res.status(200).json({
        report: report,
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

module.exports = router;
