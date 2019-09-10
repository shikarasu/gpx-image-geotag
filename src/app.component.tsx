import React, { Component } from 'react';
import './app.component.scss';
import { GpxForm, GpxPoint } from './gpx-form/gpx-form.component';
import { ImagesForm, FormImage } from './images-form/images-form.component';
import { ImagesMap } from './images-map/images-map.component';

interface AppState {
  images: FormImage[];
  points: GpxPoint[];
}

export class App extends Component<{}, AppState> {
  constructor(props) {
    super(props);

    this.handleImagesChange = this.handleImagesChange.bind(this);
    this.handleGpxChange = this.handleGpxChange.bind(this);

    this.state = {
      images: [],
      points: []
    };
  }

  handleImagesChange(images: FormImage[]) {
    this.setState({
      images: images
    });
    this.updateImagesLocation();
  }

  handleGpxChange(points: GpxPoint[]) {
    this.setState({
      points
    });
    this.updateImagesLocation();
  }

  updateImagesLocation() {
    const imagesWithGpx = this.state.images.map(image =>
      App.attachGpsCoordinates(image, this.state.points)
    );

    this.setState({
      images: imagesWithGpx
    });
  }

  static attachGpsCoordinates(image: FormImage, points: GpxPoint[]): FormImage {
    // TODO: consider updating algorithm to find midpoint (points can be far apart)
    if (image.gps) {
      return image;
    }

    // Algorithm expects that points are sorted from oldest to newest
    const closestPoint = points.find(point => point.time > image.lastModified);

    if (!closestPoint) {
      return image;
    }

    return {
      ...image,
      gps: {
        lat: closestPoint.lat,
        lon: closestPoint.lon
      }
    };
  }

  render() {
    return (
      <div className="geotag">
        <section className="g-header">
          <h1 className="g-header__title">Geotag your photos</h1>
          <h3 className="g-header__subtitle">No upload needed</h3>
        </section>

        <section className="g-step">
          <h2 className="g-step__title">1. Choose GPX file</h2>
          <GpxForm onChange={this.handleGpxChange} />
        </section>

        <section className="g-step">
          <h2 className="g-step__title">2. Choose .jpg photos</h2>
          <ImagesForm onImagesChange={this.handleImagesChange} />
        </section>

        <section className="g-step">
          <h2 className="g-step__title">3. Corelate time</h2>
          <div>
            {this.state.images.map(image => (
              <img
                src={image.thumbnailUrl}
                width="50"
                alt={image.name}
                key={image.name}
              />
            ))}
          </div>
          <ImagesMap images={this.state.images} />
        </section>
      </div>
    );
  }
}
