'use client';
import React, { useState } from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { GradientPinkBlue } from '@visx/gradient';
import { animated, useTransition, interpolate } from '@react-spring/web';

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
};

export default function CardProbabilityPieChart({
  width,
  height,
  margin = defaultMargin,
  animate = true,
}: PieProps) {
  const cardProbabilities = getCardData();
  const defaultCardProbabilities = getDefaultCardData();
  const cardCategories = cardProbabilities.map((c) => c.category) as string[];
  console.log(cardCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  return (
    <svg width={width} height={height}>
      <GradientPinkBlue id='visx-pie-gradient' />
      <rect
        rx={14}
        width={width}
        height={height}
        fill="url('#visx-pie-gradient')"
      />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={
            selectedCategory
              ? cardProbabilities.filter(
                  ({ category }) => category === selectedCategory
                )
              : cardProbabilities
          }
          pieValue={(p: CardProbability) => p.probability}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie<CardProbability>
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.category}
              onClickDatum={({ data: { category } }) =>
                animate &&
                setSelectedCategory(
                  selectedCategory && selectedCategory === category
                    ? null
                    : category
                )
              }
              getColor={(arc) =>
                getOutsidePieColor(cardCategories)(arc.data.category)
              }
            />
          )}
        </Pie>
        <Pie
          data={
            selectedCategory
              ? defaultCardProbabilities.filter(
                  ({ category }) => category === selectedCategory
                )
              : defaultCardProbabilities
          }
          pieValue={(p: CardProbability) => p.probability}
          pieSortValues={() => -1}
          outerRadius={radius - donutThickness * 1.3}
        >
          {(pie) => (
            <AnimatedPie<CardProbability>
              {...pie}
              animate={animate}
              getKey={({ data: { category } }) => category}
              onClickDatum={({ data: { category } }) =>
                animate &&
                setSelectedCategory(
                  selectedCategory && selectedCategory === category
                    ? null
                    : category
                )
              }
              getColor={(arc) =>
                getInsidePieColor(cardCategories)(arc.data.category)
              }
            />
          )}
        </Pie>
      </Group>
      {animate && (
        <text
          textAnchor='end'
          x={width - 16}
          y={height - 16}
          fill='white'
          fontSize={11}
          fontWeight={300}
          pointerEvents='none'
        >
          Click segments to update
        </text>
      )}
    </svg>
  );
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions(
    (
      props: { startAngle: any; endAngle: any; opacity: any },
      arc: PieArcDatum<Datum>,
      { key }: any
    ) => {
      const [centroidX, centroidY] = path.centroid(arc);
      const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

      return (
        <g key={key}>
          <animated.path
            // compute interpolated path d attribute from intermediate angle values
            d={interpolate(
              [props.startAngle, props.endAngle],
              (startAngle, endAngle) =>
                path({
                  ...arc,
                  startAngle,
                  endAngle,
                })
            )}
            fill={getColor(arc)}
            onClick={() => onClickDatum(arc)}
            onTouchStart={() => onClickDatum(arc)}
          />
          {hasSpaceForLabel && (
            <animated.g style={{ opacity: props.opacity }}>
              <text
                fill='white'
                x={centroidX}
                y={centroidY}
                dy='.33em'
                fontSize={9}
                textAnchor='middle'
                pointerEvents='none'
              >
                {getKey(arc)}
              </text>
            </animated.g>
          )}
        </g>
      );
    }
  );
}

const getOutsidePieColor = (domain: string[]) => {
  return scaleOrdinal({
    domain: domain,
    range: [
      'rgba(255,255,255,0.7)',
      'rgba(255,255,255,0.6)',
      'rgba(255,255,255,0.5)',
      'rgba(255,255,255,0.4)',
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0.2)',
      'rgba(255,255,255,0.1)',
    ],
  });
};
const getInsidePieColor = (domain: string[]) =>
  scaleOrdinal({
    domain: domain,
    range: [
      'rgba(93,30,91,1)',
      'rgba(93,30,91,0.8)',
      'rgba(93,30,91,0.6)',
      'rgba(93,30,91,0.4)',
    ],
  });

interface CardProbability {
  category: string;
  probability: number;
}

function getCardData(): CardProbability[] {
  return [
    { category: 'SSR', probability: 0.01 },
    { category: 'Common', probability: 0.2 },
    { category: 'UnCommon', probability: 0.79 },
  ];
}

function getDefaultCardData(): CardProbability[] {
  return [
    { category: 'SSR', probability: 0.02 },
    { category: 'Common', probability: 0.19 },
    { category: 'UnCommon', probability: 0.79 },
  ];
}
