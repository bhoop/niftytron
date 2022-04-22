import body_bot1 from "./body_bot1.png";
import body_brain from "./body_brain.png";
import body_day1 from "./body_day1.png";
import body_ice from "./body_ice.png";
import body_jade from "./body_jade.png";
import body_lava from "./body_lava.png";
import body_orange from "./body_orange.png";
import body_pink from "./body_pink.png";
import body_rainbow from "./body_rainbow.png";
import eyes_blue from "./eyes_blue.png";
import eyes_ceramic from "./eyes_ceramic.png";
import eyes_dots from "./eyes_dots.png";
import eyes_empty from "./eyes_empty.png";
import eyes_flesh from "./eyes_flesh.png";
import eyes_greenglow from "./eyes_green glow.png";
import teeth_red from "./teeth_red.png";
import teeth_white from "./teeth_white.png";
import teeth_yellow from "./teeth_yellow.png";
import teeth_yellowmiss1 from "./teeth_yellowmissin1.png";
import teeth_yellowmiss2 from "./teeth_yellowmissing2.png";
import teeth_yellowmiss4 from "./teeth_yellowmissing4.png";
import surface_chin from "./surface_chin cracks.png";
import surface_eye from "./surface_eye scar.png";
import surface_forehead from "./surface_forehead tear.png";

const layers = [
	{
		name: "body",
		pieces: [
			{
				name: "bot1",
				src: body_bot1,
			},
			{
				name: "brain",
				src: body_brain,
			},
			{
				name: "day1",
				src: body_day1,
			},
			{
				name: "ice",
				src: body_ice,
			},
			{
				name: "jade",
				src: body_jade,
			},
			{
				name: "lava",
				src: body_lava,
			},
			{
				name: "orange",
				src: body_orange,
			},
			{
				name: "pink",
				src: body_pink,
			},
			{
				name: "rainbow",
				src: body_rainbow,
			},
		],
	},
	{
		name: "teeth",
		pieces: [
			{
				name: "red",
				src: teeth_red,
			},
			{
				name: "white",
				src: teeth_white,
			},
			{
				name: "yellow",
				src: teeth_yellow,
			},
			{
				name: "yellowmiss1",
				src: teeth_yellowmiss1,
			},
			{
				name: "yellowmiss2",
				src: teeth_yellowmiss2,
			},
			{
				name: "yellowmiss4",
				src: teeth_yellowmiss4,
			},
		],
	},
	{
		name: "surface",
		pieces: [
			{
				name: "chin",
				src: surface_chin,
			},
			{
				name: "eye",
				src: surface_eye,
			},
			{
				name: "forehead",
				src: surface_forehead,
			},
		],
	},
	{
		name: "eyes",
		pieces: [
			{
				name: "blue",
				src: eyes_blue,
			},
			{
				name: "ceramic",
				src: eyes_ceramic,
			},
			{
				name: "dots",
				src: eyes_dots,
			},
			{
				name: "empty",
				src: eyes_empty,
			},
			{
				name: "flesh",
				src: eyes_flesh,
			},
			{
				name: "greenglow",
				src: eyes_greenglow,
			},
		],
	},
];

export default layers;
