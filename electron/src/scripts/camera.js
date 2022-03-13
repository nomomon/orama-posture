async function setupWebcam(videoEl) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user', // 'user' or 'environment'
            },
        })
        if ('srcObject' in videoEl) {
            videoEl.srcObject = webcamStream
        } else {
            videoEl.src = window.URL.createObjectURL(webcamStream)
        }
        return new Promise((resolve, _) => {
            videoEl.onloadedmetadata = () => {
                videoEl.width = videoEl.clientWidth
                videoEl.height = videoEl.clientHeight

                const imgWidth = videoEl.clientWidth
                const imgHeight = videoEl.clientHeight
                
                const detection = document.getElementById('detection')
                const ctx = detection.getContext('2d')
                detection.width = imgWidth
                detection.height = imgHeight

                resolve([ctx, imgHeight, imgWidth])
            }
        })
    } else {
        alert('Нет вебкамеры - извините!')
    }
}