const AWS = require('aws-sdk');

exports.uploadtoS3 = (data, fileName) => {

    const BUCKET_NAME = 'trackexpense';
    
    const S3 = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET
    });

    var params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((res, rej) => {
        S3.upload(params, (err, s3response) => {
            if (err) {
                rej(err);
            }
            else {
                res(s3response);
            }
        })
    })
}