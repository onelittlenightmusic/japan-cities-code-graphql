import { GraphQLServer } from 'graphql-yoga'
import request from 'request-promise-native'

var download = async function(url: string) {
  var body = await request.get({url});
  var response = {}
  console.log(body)
  if(typeof body == 'string') {
       response = JSON.parse(body)
  }
  return response
}

async function run() {
    var response: any = await download('https://gist.githubusercontent.com/onelittlenightmusic/5513a4a5b8252e0eed4c557bd7e1bd2f/raw/67f7ffb4ef5ff98ba2c49b4bdf57b57165e69953/japancitiescode.json')

    const cities = response['data']
    console.log(response)
	const typeDefs = `
    # Comments in GraphQL are defined with the hash (#) symbol.
    # This "Book" type can be used in other type declarations.
    type City {
      # Organization code (example: "10006"), String
      code: String
      # Prefecture name written in Kanji (example: "愛知"), String
      prefectureKanji: String
      # Prefecture name written in Japanese Kanji (example: "名古屋市"), String
      prefectureKana: String
      # City name written in Kana (example: "Fukushima", "ｱｲﾁ"), String
      cityKanji: String
      # City name written in Japanese Kana (example: "ﾅｺﾞﾔ"), String
      cityKana: String
    }
    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
      cities: [City]
      city(name: String!): City
    }
  `;

  const resolvers = {
    Query: {
      cities: () => cities,
      city: (obj:any, param:any, context: any) => cities.find((element: any) => {return element['cityKanji'] === param.name})
    },
  };

  const formatResponse = (response:any) => {
    var meta = {
      data_origin: "MIC Japan",
      source_url: "http://www.soumu.go.jp/denshijiti/code.html",
      lisence_type: "cc-by http://www.data.go.jp/data/dataset/soumu_20140909_0395/resource/dff2cb46-a11e-4879-b5d9-6c4776114e9a"
    }
    return {
      ...response,
      meta
    }
  }
	const server = new GraphQLServer({ typeDefs, resolvers })
	server.start({port: 4040, formatResponse}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
}

try {
	run()
} catch(e) {
	console.log(e)
}
