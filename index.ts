import { GraphQLServer } from 'graphql-yoga'
import fetch from 'node-fetch'
import { config } from 'dotenv'
config()
// import { QueryResolvers } from "./generated/graphqlgen";

const PORT = process.env.PORT
var download = async function(url: string) {
  var response = await fetch(url);
  return (await response.json())
}

async function run() {
  var response: any = await download('https://gist.githubusercontent.com/onelittlenightmusic/5513a4a5b8252e0eed4c557bd7e1bd2f/raw/japancitiescode.json')

  const cities = response['data']
	const typeDefs = 'schema.graphql';


  // const Query: QueryResolvers.Type = {
  //   ...QueryResolvers.defaultResolvers,
  //   cities: (_, args) => {
  //     if(args != null) {
  //       var names = args.name_in
  //       if(names != null) {
  //         return cities.filter((element: any) => (<string[]>names).some(name => name === element['cityKanji']))
  //       }
  //     }
  //     return cities
  //   },
  //   city: (_, args) => cities.find((element: any) => {return element['cityKanji'] === args.name})
  // };
  // const resolvers: any = {Query}
  const resolvers = {
    Query: {
      cities: (obj: any, param: any, context: any) => {
        if(param != null) {
          var names = param.name_in
          if(names != null) {
            return cities.filter((element: any) => {return names.includes(element['cityKanji'])})
          }
        }
        return cities
      },
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
	server.start({port: PORT, formatResponse}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
}

try {
	run()
} catch(e) {
	console.log(e)
}
