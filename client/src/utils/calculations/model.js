import * as tf from '@tensorflow/tfjs';
tf.setBackend('cpu')

export default async function train(X, Y, batchSize, epochs, learningRate, hiddenLayers,trainingPercentage, callback){

    const inputLayerShape  = batchSize;
    const inputLayerNeurons = 100;
    const inputLayerFeatures = 10;
    const inputLayerTimesteps = inputLayerNeurons / inputLayerFeatures;
    const inputShape  = [inputLayerFeatures, inputLayerTimesteps];
    const outputNeurons = 20;
    const outputLayerShape = outputNeurons;
    const outputLayerNeurons = 1;
  
    const model = tf.sequential();
    const xs = tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10));
    const ys = tf.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1]).div(tf.scalar(10));
  
    model.add(tf.layers.dense({units: inputLayerNeurons, inputShape: [inputLayerShape]}));
    model.add(tf.layers.reshape({targetShape: inputShape}));
    let lstmCells = [];

    for(let i=0;i<hiddenLayers;i++){
        lstmCells.push(tf.layers.lstmCell({units: outputNeurons}));
    }
  
    model.add(tf.layers.rnn({
      cell: lstmCells,
      inputShape: inputShape,
      returnSequences: false
    }));
  
    model.add(tf.layers.dense({units: outputLayerNeurons, inputShape: [outputLayerShape]}));
  
    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError'
    });
  
    const history = await model.fit(xs, ys,
      { batchSize: batchSize, epochs: epochs, callbacks: {
        onEpochEnd: async (epoch, log) => {
        console.log(model.layers,X.length,xs, ys,)
          let inputs=[...X]
          let trainX = inputs.slice(0, Math.floor(trainingPercentage / 100 * inputs.length));
          let pred = makePredictions(trainX, model)
          callback(epoch, log, pred);
        }
      }
    });
  
    return { model: model, stats: history };
  }
  
  export function makePredictions(X, model){
    const predictedResults = model.predict(tf.tensor2d(X, [X.length, X[0].length]).div(tf.scalar(10))).mul(10);
    return Array.from(predictedResults.dataSync());
  }
  