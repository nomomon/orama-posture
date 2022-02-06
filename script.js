let model

async function loadModel(){
    const params = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    }

    model = await posenet.load(params)
}

async function getKeyPoints(image, model){
    const pose = await model.estimateSinglePose(image, {
        flipHorizontal: false
    })

    return pose
}
