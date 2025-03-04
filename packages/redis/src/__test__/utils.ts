import { redisClient, IRedisClient, RedisStreamMetadata } from "..";
import {
    JsonMessageEncoder,
    ObjectNameMessageTypeMapper,
    IMessageDispatcher,
    IMessage,
    IDispatchContext,
    Lifecycle,
    makeLifecycle,
} from "@walmartlabs/cookie-cutter-core";

export function createRedisClient(): Lifecycle<IRedisClient> {
    return makeLifecycle(
        redisClient({
            host: "localhost",
            encoder: new JsonMessageEncoder(),
            typeMapper: new ObjectNameMessageTypeMapper(),
        })
    );
}

export class RepublishMessageDispatcher implements IMessageDispatcher {
    canDispatch(_: IMessage): boolean {
        return true;
    }

    async dispatch(msg: IMessage, ctx: IDispatchContext<any>): Promise<any> {
        const stream = ctx.metadata<string>(RedisStreamMetadata.Stream);
        ctx.publish({ name: msg.type } as any, msg.payload, {
            [RedisStreamMetadata.Stream]: stream,
        });
    }
}
